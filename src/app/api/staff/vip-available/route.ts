import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { type VipStaffInfo, type StaffAvailability } from '@/lib/vipStaffUtils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/staff/vip-available
 *
 * Returns all active KTV with their real-time availability status.
 * Combines: Staff + TurnQueue + KTVLeaveRequests
 *
 * Response shape: { staff: VipStaffInfo[] }
 *
 * Availability logic:
 *   ON_LEAVE    → Has KTVLeaveRequests record (APPROVED/PENDING) for today
 *   AVAILABLE   → In TurnQueue today, status = 'waiting'
 *   BUSY        → In TurnQueue today, status = 'working' or 'assigned'
 *   OFF_TODAY   → Not in TurnQueue (didn't check in) & no leave record
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // ─── Step 1: Fetch all active staff ─────────────────────────────────────
    const { data: staffList, error: staffError } = await supabase
      .from('Staff')
      .select('id, full_name, avatar_url, gender, skills, height')
      .eq('status', 'ĐANG LÀM')
      .order('full_name');

    if (staffError) {
      console.error('[vip-available] Staff query error:', staffError);
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }

    if (!staffList || staffList.length === 0) {
      return NextResponse.json({ staff: [] });
    }

    // ─── Step 2: Fetch TurnQueue for today ──────────────────────────────────
    const staffIds = staffList.map((s) => s.id);

    const { data: turnQueueList, error: tqError } = await supabase
      .from('TurnQueue')
      .select('employee_id, status, estimated_end_time, current_order_id')
      .eq('date', today)
      .in('employee_id', staffIds);

    if (tqError) {
      console.error('[vip-available] TurnQueue query error:', tqError);
      // Non-fatal — continue with no queue data
    }

    // ─── Step 3: Fetch leave requests for today ──────────────────────────────
    const { data: leaveList, error: leaveError } = await supabase
      .from('KTVLeaveRequests')
      .select('employeeId, status, is_sudden_off')
      .eq('date', today)
      .in('status', ['APPROVED', 'PENDING'])
      .in('employeeId', staffIds);

    if (leaveError) {
      console.error('[vip-available] LeaveRequests query error:', leaveError);
      // Non-fatal — continue with no leave data
    }

    // ─── Step 4: Build lookup maps ───────────────────────────────────────────
    const turnQueueMap = new Map<
      string,
      { status: string; estimated_end_time: string | null; current_order_id: string | null }
    >();
    for (const tq of turnQueueList ?? []) {
      turnQueueMap.set(tq.employee_id, {
        status: tq.status,
        estimated_end_time: tq.estimated_end_time,
        current_order_id: tq.current_order_id,
      });
    }

    const onLeaveSet = new Set<string>();
    for (const leave of leaveList ?? []) {
      onLeaveSet.add(leave.employeeId);
    }

    // ─── Step 5: Merge into VipStaffInfo[] ──────────────────────────────────
    const result: VipStaffInfo[] = staffList.map((s) => {
      const tq = turnQueueMap.get(s.id);
      const isOnLeave = onLeaveSet.has(s.id);

      let availability: StaffAvailability;
      let estimatedEndTime: string | null = null;
      let currentOrderId: string | null = null;

      if (isOnLeave) {
        availability = 'ON_LEAVE';
      } else if (!tq) {
        // Not checked in today
        availability = 'OFF_TODAY';
      } else if (tq.status === 'waiting') {
        availability = 'AVAILABLE';
      } else if (tq.status === 'working' || tq.status === 'assigned') {
        availability = 'BUSY';
        estimatedEndTime = tq.estimated_end_time;
        currentOrderId = tq.current_order_id;
      } else {
        // 'off' or other
        availability = 'OFF_TODAY';
      }

      return {
        id: s.id,
        fullName: s.full_name,
        avatarUrl: s.avatar_url ?? null,
        gender: s.gender ?? null,
        skills: s.skills ?? {},
        height: s.height ?? null,
        availability,
        estimatedEndTime,
        currentOrderId,
      };
    });

    // ─── Step 6: Sort — AVAILABLE first, then BUSY, then others ─────────────
    const SORT_ORDER: Record<StaffAvailability, number> = {
      AVAILABLE: 0,
      BUSY: 1,
      OFF_TODAY: 2,
      ON_LEAVE: 3,
    };

    result.sort((a, b) => SORT_ORDER[a.availability] - SORT_ORDER[b.availability]);

    return NextResponse.json({ staff: result });

  } catch (error: any) {
    console.error('[vip-available] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
