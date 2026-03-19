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
            // Extract ktvCode from request (for per-KTV rating)
            const { ktvCode } = body;

            // 1. Build update payload
            const updatePayload: any = {
                itemFeedback: itemFeedback || null,
            };

            if (ktvCode) {
                // Per-KTV rating: update ktvRatings JSONB map
                // First read existing ktvRatings
                const { data: existingItem } = await supabaseAdmin
                    .from('BookingItems')
                    .select('ktvRatings, technicianCodes')
                    .eq('id', bookingItemId)
                    .eq('bookingId', bookingId)
                    .maybeSingle();

                const existingRatings: Record<string, number> = existingItem?.ktvRatings || {};
                existingRatings[ktvCode.trim()] = itemRating;

                updatePayload.ktvRatings = existingRatings;

                // Check if ALL KTVs in technicianCodes have been rated
                const techCodes: string[] = existingItem?.technicianCodes || [];
                const allKtvsRated = techCodes.length > 0 && techCodes.every(
                    (code: string) => existingRatings[code.trim()] !== undefined
                );

                if (allKtvsRated) {
                    // All KTVs rated → set itemRating as the average/last rating + mark DONE
                    const ratings = techCodes.map((c: string) => existingRatings[c.trim()]).filter(Boolean);
                    updatePayload.itemRating = Math.round(ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length);
                    updatePayload.status = 'DONE';
                }
                // If not all KTVs rated yet → DON'T set itemRating or DONE status
            } else {
                // Single-KTV: set itemRating directly (legacy flow)
                updatePayload.itemRating = itemRating;
                updatePayload.status = 'DONE';
            }

            const { error: itemError } = await supabaseAdmin
                .from('BookingItems')
                .update(updatePayload)
                .eq('id', bookingItemId)
                .eq('bookingId', bookingId);

            if (itemError) {
                console.error('Supabase item rating error:', itemError);
                return NextResponse.json({ error: itemError.message }, { status: 500 });
            }

            // 2. Re-query toàn bộ items để check xem tất cả đã rated chưa
            const { data: allItems, error: fetchError } = await supabaseAdmin
                .from('BookingItems')
                .select('id, itemRating, status, technicianCodes, ktvRatings')
                .eq('bookingId', bookingId);

            if (fetchError) {
                console.error('Error fetching items after rating:', fetchError);
                return NextResponse.json({ error: fetchError.message }, { status: 500 });
            }

            // Check all rated: for multi-KTV items, check ktvRatings instead of itemRating
            const allRated = (allItems || []).length > 0 
                && (allItems || []).every((i: any) => {
                    const techCodes: string[] = i.technicianCodes || [];
                    if (techCodes.length > 1) {
                        // Multi-KTV: check ktvRatings has all tech codes
                        const ktvR: Record<string, number> = i.ktvRatings || {};
                        return techCodes.every((c: string) => ktvR[c.trim()] !== undefined);
                    }
                    // Single-KTV: check itemRating
                    return i.itemRating !== null && i.itemRating !== undefined;
                });

            if (allRated) {
                // Tất cả dịch vụ đã được đánh giá → cập nhật booking DONE
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
