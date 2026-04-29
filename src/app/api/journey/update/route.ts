import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';


export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        let { 
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

        // 🔒 Resolve accessToken → real booking ID (backward compatible)
        const { data: resolved } = await supabaseAdmin
            .from('Bookings')
            .select('id')
            .or(`accessToken.eq.${bookingId},id.eq.${bookingId}`)
            .maybeSingle();

        if (resolved) {
            bookingId = resolved.id; // Use real ID for all subsequent queries
        }

        // --- Per-item rating: khi khách đánh giá 1 dịch vụ cụ thể ---
        if (bookingItemId && itemRating !== undefined) {
            // Extract ktvCode from request (for per-KTV rating)
            const { ktvCode } = body;

            // 1. Build update payload
            const updatePayload: any = {
                itemFeedback: itemFeedback || null,
            };

            let useKtvRatings = false; // Track if ktvRatings column is available

            if (ktvCode) {
                // Per-KTV rating: try to use ktvRatings JSONB map
                // First read existing item data
                const { data: existingItem, error: readError } = await supabaseAdmin
                    .from('BookingItems')
                    .select('ktvRatings, technicianCodes')
                    .eq('id', bookingItemId)
                    .eq('bookingId', bookingId)
                    .maybeSingle();

                if (readError) {
                    // ktvRatings column might not exist — try reading without it
                    console.warn('[journey/update] ktvRatings read failed (column may not exist):', readError.message);
                    
                    const { data: fallbackItem } = await supabaseAdmin
                        .from('BookingItems')
                        .select('technicianCodes')
                        .eq('id', bookingItemId)
                        .eq('bookingId', bookingId)
                        .maybeSingle();

                    // Fallback: just update itemRating directly
                    updatePayload.itemRating = itemRating;
                    updatePayload.status = 'DONE';
                    useKtvRatings = false;
                } else {
                    // ktvRatings column exists — use per-KTV flow
                    useKtvRatings = true;
                    const existingRatings: Record<string, number> = existingItem?.ktvRatings || {};
                    existingRatings[ktvCode.trim()] = itemRating;

                    updatePayload.ktvRatings = existingRatings;

                    // Check if ALL KTVs in technicianCodes have been rated
                    const techCodes: string[] = existingItem?.technicianCodes || [];
                    const allKtvsRated = techCodes.length > 0 && techCodes.every(
                        (code: string) => existingRatings[code.trim()] !== undefined
                    );

                    if (allKtvsRated) {
                        // All KTVs rated → set itemRating as the average + mark DONE
                        const ratings = techCodes.map((c: string) => existingRatings[c.trim()]).filter(Boolean);
                        updatePayload.itemRating = Math.round(ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length);
                        updatePayload.status = 'DONE';
                    }
                    // If not all KTVs rated yet → DON'T set itemRating or DONE status
                }
            } else {
                // Single-KTV: set itemRating + luôn ghi ktvRatings cho lịch sử KTV
                updatePayload.itemRating = itemRating;
                updatePayload.status = 'DONE';

                // Đọc technicianCodes để ghi ktvRatings cho KTV
                try {
                    const { data: singleItem, error: singleReadErr } = await supabaseAdmin
                        .from('BookingItems')
                        .select('technicianCodes, ktvRatings')
                        .eq('id', bookingItemId)
                        .eq('bookingId', bookingId)
                        .maybeSingle();

                    if (!singleReadErr && singleItem?.technicianCodes) {
                        useKtvRatings = true;
                        const ktvR: Record<string, number> = singleItem.ktvRatings || {};
                        // Gán rating cho tất cả KTV trong item
                        (singleItem.technicianCodes as string[]).forEach((code: string) => {
                            if (code.trim()) ktvR[code.trim()] = itemRating;
                        });
                        updatePayload.ktvRatings = ktvR;
                    }
                } catch {
                    // ktvRatings column chưa tồn tại — bỏ qua, chỉ dùng itemRating
                }
            }

            // 2. Try to update BookingItem
            let updateError;
            ({ error: updateError } = await supabaseAdmin
                .from('BookingItems')
                .update(updatePayload)
                .eq('id', bookingItemId)
                .eq('bookingId', bookingId));

            // If update failed and we tried ktvRatings, retry without it
            if (updateError && updatePayload.ktvRatings) {
                console.warn('[journey/update] Update with ktvRatings failed, retrying without:', updateError.message);
                delete updatePayload.ktvRatings;
                updatePayload.itemRating = itemRating;
                updatePayload.status = 'DONE';
                useKtvRatings = false;

                ({ error: updateError } = await supabaseAdmin
                    .from('BookingItems')
                    .update(updatePayload)
                    .eq('id', bookingItemId)
                    .eq('bookingId', bookingId));
            }

            if (updateError) {
                console.error('Supabase item rating error:', updateError);
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }

            // 🌟 Thông báo khi khách đánh giá "Xuất sắc" (rating = 4)
            if (itemRating === 4) {
                try {
                    // Xác định danh sách KTV codes
                    let techCodesForNotif: string[] = [];
                    if (ktvCode) {
                        techCodesForNotif = [ktvCode.trim()];
                    } else {
                        // Read technicianCodes from the item
                        const { data: itemForNotif } = await supabaseAdmin
                            .from('BookingItems')
                            .select('technicianCodes')
                            .eq('id', bookingItemId)
                            .eq('bookingId', bookingId)
                            .maybeSingle();
                        techCodesForNotif = (itemForNotif?.technicianCodes || []).map((c: string) => c.trim()).filter(Boolean);
                    }

                    const ktvDisplay = techCodesForNotif.join(', ') || 'KTV';

                    // 1️⃣ Thông báo cho QUẦY LỄ TÂN (dispatch board popup)
                    await supabaseAdmin.from('StaffNotifications').insert({
                        bookingId,
                        type: 'FEEDBACK',
                        message: `🌟 Khách đánh giá XUẤT SẮC cho NV ${ktvDisplay}!`,
                        isRead: false,
                        createdAt: new Date().toISOString(),
                    });

                    // 2️⃣ Thông báo cho TỪNG KTV (KTV dashboard bonusMessage)
                    for (const code of techCodesForNotif) {
                        if (!code) continue;
                        await supabaseAdmin.from('StaffNotifications').insert({
                            bookingId,
                            employeeId: code,
                            type: 'REWARD',
                            message: `🌟 Khách hàng vừa đánh giá bạn XUẤT SẮC! Tiếp tục phát huy nhé!`,
                            isRead: false,
                            createdAt: new Date().toISOString(),
                        });
                    }
                    // 3️⃣ Gọi API Web Push để bắn thông báo ra ngoài màn hình (Push Notification)
                    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3000';
                    const webhookSecret = process.env.WEBHOOK_SECRET || '';

                    // 3.1 Push cho Quầy (ADMIN, RECEPTIONIST)
                    await fetch(`${adminUrl}/api/notifications/push`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-webhook-secret': webhookSecret
                        },
                        body: JSON.stringify({
                            title: 'Đánh giá Xuất Sắc! 🌟',
                            message: `Khách hàng vừa đánh giá XUẤT SẮC cho NV ${ktvDisplay}!`,
                            targetRoles: ['ADMIN', 'RECEPTIONIST']
                        })
                    }).catch(err => console.error('[journey/update] Web Push to Reception failed:', err));

                    // 3.2 Push cho KTV
                    if (techCodesForNotif.length > 0) {
                        await fetch(`${adminUrl}/api/notifications/push`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-webhook-secret': webhookSecret
                            },
                            body: JSON.stringify({
                                title: 'Bạn nhận được đánh giá Xuất Sắc! 🌟',
                                message: `Tuyệt vời! Khách hàng vừa đánh giá bạn XUẤT SẮC. Tiếp tục phát huy nhé!`,
                                targetStaffIds: techCodesForNotif
                            })
                        }).catch(err => console.error('[journey/update] Web Push to KTV failed:', err));
                    }

                } catch (notifErr) {
                    // Non-critical: don't fail the rating update if notification fails
                    console.error('[journey/update] Notification insert error:', notifErr);
                }
            }

            // 3. Re-query toàn bộ items để check xem tất cả đã rated chưa
            // Select ktvRatings only if column is available
            const selectFields = useKtvRatings
                ? 'id, itemRating, status, technicianCodes, ktvRatings'
                : 'id, itemRating, status, technicianCodes';

            const { data: allItems, error: fetchError } = await supabaseAdmin
                .from('BookingItems')
                .select(selectFields)
                .eq('bookingId', bookingId);

            if (fetchError) {
                console.error('Error fetching items after rating:', fetchError);
                return NextResponse.json({ error: fetchError.message }, { status: 500 });
            }

            // Check all rated: for multi-KTV items with ktvRatings, check per-KTV
            const allRated = (allItems || []).length > 0 
                && (allItems || []).every((i: any) => {
                    const techCodes: string[] = i.technicianCodes || [];
                    if (useKtvRatings && techCodes.length > 1 && i.ktvRatings) {
                        // Multi-KTV with ktvRatings: check all tech codes rated
                        const ktvR: Record<string, number> = i.ktvRatings || {};
                        return techCodes.every((c: string) => ktvR[c.trim()] !== undefined);
                    }
                    // Fallback: check itemRating
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
