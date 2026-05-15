import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/booking/vip-appointment
 * Receives VIP appointment data from customer and creates a booking record.
 * Admin will manually contact the customer to confirm.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { customerName, customerPhone, selectedStaffIds, duration, timeSlot, appointmentDate, totalPrice, lang } = body;

        if (!customerName?.trim()) {
            return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
        }
        if (!customerPhone?.trim()) {
            return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 });
        }
        if (!selectedStaffIds || selectedStaffIds.length === 0) {
            return NextResponse.json({ error: 'At least one staff must be selected' }, { status: 400 });
        }
        if (!duration) {
            return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        // Generate a unique booking ID
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const bookingId = `VIP-${dateStr}-${randomSuffix}`;
        const billCode = `NH-VIP-${dateStr}-${randomSuffix}`;

        // Build notes with VIP booking details
        const notesObj = {
            type: 'VIP_APPOINTMENT',
            selectedStaffIds,
            duration,
            timeSlot: timeSlot || 'BRANCH_DECIDE',
            appointmentDate: appointmentDate || null,
            totalPrice,
            customerLang: lang || 'vi',
            bookedAt: now.toISOString(),
        };

        // Insert into Bookings table
        const { data: booking, error: bookingError } = await supabase
            .from('Bookings')
            .insert({
                id: bookingId,
                billCode,
                branchName: 'Ngan Ha Spa',
                bookingDate: now.toISOString(),
                timeBooking: timeSlot && timeSlot !== 'BRANCH_DECIDE' ? timeSlot : null,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerEmail: body.customerEmail?.trim() || null,
                customerLang: lang || 'vi',
                technicianCode: selectedStaffIds[0] || null,
                totalAmount: totalPrice || 0,
                status: 'NEW',
                notes: JSON.stringify(notesObj),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
            })
            .select('id, billCode')
            .single();

        if (bookingError) {
            console.error('[VIP-Appointment] Insert error:', bookingError);
            return NextResponse.json({ error: 'Failed to create appointment', detail: bookingError.message }, { status: 500 });
        }

        // Send notification to admin/reception
        try {
            const staffNames = selectedStaffIds.join(', ');
            const notifMessage = `📋 Đặt lịch VIP mới!\n👤 ${customerName} - ${customerPhone}\n👨‍⚕️ KTV: ${staffNames}\n⏱️ ${duration} phút\n📅 ${timeSlot && timeSlot !== 'BRANCH_DECIDE' ? `Hẹn lúc ${timeSlot}` : 'Đến trực tiếp'}\n💰 ${totalPrice?.toLocaleString('vi-VN')}đ`;

            await supabase.from('StaffNotifications').insert({
                bookingId: bookingId,
                employeeId: null, // null = broadcast to all admin/reception
                type: 'NEW_ORDER',
                message: notifMessage,
                isRead: false,
                createdAt: now.toISOString(),
            });
        } catch (notifErr) {
            // Non-critical: log but don't fail the request
            console.error('[VIP-Appointment] Notification error:', notifErr);
        }

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            billCode: booking.billCode,
            message: 'VIP appointment created successfully',
        });

    } catch (error: any) {
        console.error('[VIP-Appointment] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
