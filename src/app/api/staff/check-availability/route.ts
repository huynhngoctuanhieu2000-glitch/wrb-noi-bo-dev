import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  buildVipTimeline,
  intersectTimelines,
  type TimelineInput,
  type TimelineResult,
} from '@/lib/vipTimelineBuilder';

export const dynamic = 'force-dynamic';

// ─── Types ───────────────────────────────────────────────────────────────────

type BookingConfidence = 'CONFIRMED' | 'NEEDS_CONFIRM' | 'RISKY';

interface StaffAvailabilityResult {
  staffId: string;
  staffName: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFF' | 'UNKNOWN';
  reason?: string;
  availableAfter?: string; // "HH:mm"
  confidence: BookingConfidence;
}

interface CheckAvailabilityResponse {
  results: StaffAvailabilityResult[];
  overallConfidence: BookingConfidence;
  warnings: string[];
  // Timeline — only when date = today
  timeline?: TimelineResult | null;
  intersectedSlots?: ReturnType<typeof intersectTimelines> | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get today's date in Vietnam timezone (Asia/Ho_Chi_Minh) as YYYY-MM-DD */
const getTodayVN = (): string =>
  new Date().toLocaleDateString('sv', { timeZone: 'Asia/Ho_Chi_Minh' });

/** Determine if a given date string (YYYY-MM-DD) is today in VN timezone */
const isToday = (dateStr: string): boolean => dateStr === getTodayVN();

/** Parse "HH:mm" to total minutes from midnight */
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * GET /api/staff/check-availability
 *
 * Query params:
 *   staffIds  = "NH001,NH003"  (comma-separated)
 *   date      = "2026-05-20"   (YYYY-MM-DD)
 *   time      = "15:00"        (HH:mm, optional — for walk-in exact time check)
 *   duration  = "90"           (minutes, optional — for timeline suggested slots)
 *
 * Response: { results, overallConfidence, warnings, timeline?, intersectedSlots? }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const staffIdsRaw = searchParams.get('staffIds') ?? '';
    const dateParam = searchParams.get('date') ?? getTodayVN(); // Default to VN today
    const timeParam = searchParams.get('time') ?? null; // "HH:mm" or null
    const durationParam = parseInt(searchParams.get('duration') ?? '60', 10);

    const staffIds = staffIdsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (staffIds.length === 0) {
      return NextResponse.json({ error: 'staffIds is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const checkingToday = isToday(dateParam);
    const warnings: string[] = [];

    // ─── Step 1: Fetch Staff names ─────────────────────────────────────────
    const { data: staffList } = await supabase
      .from('Staff')
      .select('id, full_name')
      .in('id', staffIds);

    const staffNameMap = new Map<string, string>();
    for (const s of staffList ?? []) {
      staffNameMap.set(s.id, s.full_name);
    }

    // ─── Step 2: Check KTVLeaveRequests for target date ───────────────────
    const { data: leaveList } = await supabase
      .from('KTVLeaveRequests')
      .select('employeeId, status')
      .eq('date', dateParam)
      .in('status', ['APPROVED', 'PENDING'])
      .in('employeeId', staffIds);

    const onLeaveMap = new Map<string, 'APPROVED' | 'PENDING'>();
    for (const l of leaveList ?? []) {
      onLeaveMap.set(l.employeeId, l.status);
    }

    // ─── Step 3: Check TurnQueue (only relevant for today) ───────────────
    const turnQueueMap = new Map<
      string,
      { status: string; estimated_end_time: string | null }
    >();

    if (checkingToday) {
      const { data: tqList } = await supabase
        .from('TurnQueue')
        .select('employee_id, status, estimated_end_time')
        .eq('date', dateParam)
        .in('employee_id', staffIds);

      for (const tq of tqList ?? []) {
        turnQueueMap.set(tq.employee_id, {
          status: tq.status,
          estimated_end_time: tq.estimated_end_time,
        });
      }
    }

    // ─── Step 4: Fetch Bookings for this KTV on this date ─────────────────
    //    (needed for timeline building AND exact-time conflict check)
    // bookingDate is a timestamp, so query a full-day range
    const { data: bookingsList } = await supabase
      .from('Bookings')
      .select('id, technicianCode, timeBooking, status, notes, totalAmount')
      .gte('bookingDate', `${dateParam}T00:00:00`)
      .lt('bookingDate', `${dateParam}T23:59:59`)
      .in('status', ['NEW', 'PENDING_CONFIRM', 'PREPARING', 'READY', 'IN_PROGRESS'])
      .in('technicianCode', staffIds);

    // Parse notes for VIP type + duration
    const parsedBookings = (bookingsList ?? []).map((b) => {
      let notesObj: Record<string, unknown> = {};
      try {
        notesObj = b.notes ? JSON.parse(b.notes) : {};
      } catch {
        /* ignore parse errors */
      }
      return {
        id: b.id,
        ktvId: b.technicianCode as string,
        timeBooking: b.timeBooking as string | null,
        duration: (notesObj.duration as number) ?? 60,
        status: b.status as string,
        isVipAppointment: notesObj.type === 'VIP_APPOINTMENT',
      };
    });

    // ─── Step 5: Fetch KTVShiftRecords for shift-aware timeline ──────────
    const shiftMap = new Map<string, string>(); // ktvId → shift_type

    const { data: shiftList } = await supabase
      .from('KTVShiftRecords')
      .select('employee_id, shift_type')
      .in('employee_id', staffIds)
      .eq('status', 'ACTIVE')
      .lte('effective_from', dateParam) // effective_from <= targetDate
      .order('effective_from', { ascending: false });

    // Take most recent shift per staff
    const seenShifts = new Set<string>();
    for (const sr of shiftList ?? []) {
      if (!seenShifts.has(sr.employee_id)) {
        shiftMap.set(sr.employee_id, sr.shift_type);
        seenShifts.add(sr.employee_id);
      }
    }

    // ─── Step 6: Build per-staff availability results ─────────────────────
    const results: StaffAvailabilityResult[] = [];
    const timelines: TimelineResult[] = [];

    for (const staffId of staffIds) {
      const staffName = staffNameMap.get(staffId) ?? staffId;
      const leaveStatus = onLeaveMap.get(staffId);
      const tq = turnQueueMap.get(staffId);

      let status: StaffAvailabilityResult['status'] = 'UNKNOWN';
      let confidence: BookingConfidence = 'NEEDS_CONFIRM';
      let reason: string | undefined;
      let availableAfter: string | undefined;

      // Case A: On leave for this date
      if (leaveStatus) {
        status = 'OFF';
        confidence = 'RISKY';
        reason = leaveStatus === 'APPROVED'
          ? `KTV ${staffName} đã được duyệt nghỉ ngày ${dateParam}`
          : `KTV ${staffName} đang chờ duyệt nghỉ ngày ${dateParam}`;
        warnings.push(`⚠️ ${reason}. Tiệm sẽ liên hệ xác nhận lại.`);
      }
      // Case B: Today — check TurnQueue
      else if (checkingToday) {
        if (!tq) {
          // Not checked in
          status = 'OFF';
          confidence = 'NEEDS_CONFIRM';
          reason = `KTV ${staffName} chưa điểm danh hôm nay`;
          warnings.push(`ℹ️ KTV ${staffName} chưa điểm danh. Tiệm sẽ xác nhận.`);
        } else if (tq.status === 'waiting') {
          status = 'AVAILABLE';
          confidence = 'CONFIRMED';
          // Additional check: if timeParam provided, verify exact slot
          if (timeParam && tq.estimated_end_time) {
            const reqMin = timeToMinutes(timeParam);
            const endMin = timeToMinutes(tq.estimated_end_time);
            if (reqMin < endMin) {
              status = 'BUSY';
              confidence = 'NEEDS_CONFIRM';
              availableAfter = tq.estimated_end_time;
              reason = `KTV ${staffName} dự kiến rảnh lúc ${tq.estimated_end_time}`;
              warnings.push(`⏰ KTV ${staffName} đang phục vụ, dự kiến rảnh lúc ${tq.estimated_end_time}`);
            }
          }
        } else if (tq.status === 'working' || tq.status === 'assigned') {
          status = 'BUSY';
          confidence = 'NEEDS_CONFIRM';
          availableAfter = tq.estimated_end_time ?? undefined;
          reason = `KTV ${staffName} đang phục vụ khách` +
            (tq.estimated_end_time ? `, dự kiến rảnh lúc ${tq.estimated_end_time}` : '');
          warnings.push(`⏰ ${reason}`);
        } else {
          // status = 'off' (end of shift)
          status = 'OFF';
          confidence = 'NEEDS_CONFIRM';
          reason = `KTV ${staffName} đã kết thúc ca làm việc`;
        }
      }
      // Case C: Future date — only leave check available
      else {
        status = 'UNKNOWN';
        confidence = 'NEEDS_CONFIRM';
        reason = `Lịch ngày ${dateParam} chưa được xác nhận`;
      }

      results.push({ staffId, staffName, status, reason, availableAfter, confidence });

      // Build timeline for today (used by UI visual)
      if (checkingToday) {
        const ktvBookings = parsedBookings.filter((b) => b.ktvId === staffId);
        const timelineInput: TimelineInput = {
          ktvId: staffId,
          date: dateParam,
          turnQueueStatus: (tq?.status as TimelineInput['turnQueueStatus']) ?? null,
          estimatedEndTime: tq?.estimated_end_time ?? null,
          bookings: ktvBookings,
          shiftType: shiftMap.get(staffId) ?? 'FREE',
          minDurationMinutes: durationParam,
        };
        timelines.push(buildVipTimeline(timelineInput));
      }
    }

    // ─── Step 7: Calculate overall confidence ─────────────────────────────
    const CONFIDENCE_PRIORITY: Record<BookingConfidence, number> = {
      RISKY: 2,
      NEEDS_CONFIRM: 1,
      CONFIRMED: 0,
    };

    let overallConfidence: BookingConfidence = 'CONFIRMED';
    for (const r of results) {
      if (CONFIDENCE_PRIORITY[r.confidence] > CONFIDENCE_PRIORITY[overallConfidence]) {
        overallConfidence = r.confidence;
      }
    }

    // ─── Step 8: Build response ───────────────────────────────────────────
    const response: CheckAvailabilityResponse = {
      results,
      overallConfidence,
      warnings,
    };

    // Attach timeline data if today
    if (checkingToday && timelines.length > 0) {
      response.timeline = timelines.length === 1 ? timelines[0] : null;
      response.intersectedSlots =
        timelines.length > 1
          ? intersectTimelines(timelines, durationParam)
          : timelines[0].slots;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[check-availability] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
