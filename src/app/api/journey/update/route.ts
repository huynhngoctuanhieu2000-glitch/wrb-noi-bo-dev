import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';


export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { 
            bookingId, 
            status, 
            violations, 
            rating, 
            tipAmount, 
            feedbackNote,
            // Per-item rating support
            bookingItemId,
            itemRating,
            itemFeedback,
        } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
        }

        // --- Per-item rating: khi khách đánh giá 1 dịch vụ cụ thể ---
        if (bookingItemId && itemRating !== undefined) {
            // 1. Lưu rating cho item này
            const { error: itemError } = await supabaseAdmin
                .from('BookingItems')
                .update({
                    itemRating: itemRating,
                    itemFeedback: itemFeedback || null,
                    status: 'DONE',
                })
                .eq('id', bookingItemId)
                .eq('bookingId', bookingId);

            if (itemError) {
                console.error('Supabase item rating error:', itemError);
                return NextResponse.json({ error: itemError.message }, { status: 500 });
            }

            // 2. Re-query toàn bộ items để check xem tất cả đã rated chưa
            const { data: allItems, error: fetchError } = await supabaseAdmin
                .from('BookingItems')
                .select('id, itemRating, status')
                .eq('bookingId', bookingId);

            if (fetchError) {
                console.error('Error fetching items after rating:', fetchError);
                return NextResponse.json({ error: fetchError.message }, { status: 500 });
            }

            const allRated = (allItems || []).length > 0 
                && (allItems || []).every(i => i.itemRating !== null && i.itemRating !== undefined);

            if (allRated) {
                // Tất cả dịch vụ đã được đánh giá → cập nhật booking DONE
                // ⚠️ KHÔNG set Bookings.rating ở đây — trigger cũ sẽ gửi cùng 1 rating cho tất cả KTV
                // Per-item rating đã được lưu trong BookingItems.itemRating → trigger mới xử lý riêng
                const { error: bookingError } = await supabaseAdmin
                    .from('Bookings')
                    .update({ 
                        status: 'DONE',
                        timeEnd: new Date().toISOString(),
                        ...(tipAmount !== undefined && { tipAmount }),
                        ...(feedbackNote !== undefined && { feedbackNote }),
                    })
                    .eq('id', bookingId);

                if (bookingError) {
                    console.error('Supabase booking DONE error:', bookingError);
                    return NextResponse.json({ error: bookingError.message }, { status: 500 });
                }

                return NextResponse.json({ success: true, allRated: true, bookingStatus: 'DONE' }, { status: 200 });
            }

            return NextResponse.json({ success: true, allRated: false, itemId: bookingItemId }, { status: 200 });
        }

        // --- Booking-level update (legacy / non-item-specific) ---
        const updatePayload: any = {};

        if (status) updatePayload.status = status;
        if (violations !== undefined) updatePayload.violations = violations;
        if (rating !== undefined) updatePayload.rating = rating;
        if (tipAmount !== undefined) updatePayload.tipAmount = tipAmount;
        if (feedbackNote !== undefined) updatePayload.feedbackNote = feedbackNote;

        const { data, error } = await supabaseAdmin
            .from('Bookings')
            .update(updatePayload)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, booking: data }, { status: 200 });

    } catch (error: any) {
        console.error('API Error updating journey:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
