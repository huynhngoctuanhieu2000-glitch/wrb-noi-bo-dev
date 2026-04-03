import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

export type JourneyStatus = 'NEW' | 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'FEEDBACK' | 'DONE';

// Enriched service item with computed fields for per-service timer
export interface ServiceItem {
    id: string;
    serviceId: string;
    service_name: string;
    duration: number; // in minutes
    technicianCode: string;
    staffName: string;
    staffAvatar: string;
    computedTimeStart: string | null;
    quantity: number;
    price: number;
    options?: any;
    // Per-item completion & rating fields
    status: string | null;
    itemRating: number | null;
    itemFeedback: string | null;
    // Per-KTV rating (when 2+ KTVs share 1 service)
    ktvRatings?: Record<string, number>;
    // Per-item room/bed (multi-tech multi-room)
    roomName: string | null;
    bedId: string | null;
}

export interface JourneyData {
    id: string;
    status: JourneyStatus;
    timeStart: string | null;
    timeEnd: string | null;
    rating: number | null;
    violations: number[] | null;
    tipAmount: number | null;
    staffName?: string;
    staffAvatar?: string;
    createdAt?: string;
    totalDuration: number; // Phút
    items: ServiceItem[];
    roomName?: string;
    bedId?: string;
}


export function useJourneyRealtime(bookingId: string) {
    const [data, setData] = useState<JourneyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // booking.id thật (có thể khác bookingId URL param nếu user dùng billCode)
    const [resolvedId, setResolvedId] = useState<string>(bookingId);

    const fetchState = useCallback(async () => {
        if (!bookingId) {
            setLoading(false);
            return;
        }

        const supabase = createClient();
        try {
            const { data: booking, error: fetchError } = await supabase
                .from('Bookings')
                .select('*')
                .eq('accessToken', bookingId)
                .maybeSingle();

            if (fetchError) {
                console.error('Supabase fetch error:', fetchError);
                throw fetchError;
            }

            if (!booking) {
                setError('Không tìm thấy đơn hàng hoặc đơn hàng đã bị xóa.');
                setLoading(false);
                return;
            }

            if (booking) {
                // Lưu booking.id thật để dùng cho realtime + items query
                const realId = booking.id;
                setResolvedId(realId);

                const { data: items } = await supabase
                    .from('BookingItems')
                    .select('*')
                    .eq('bookingId', realId); // Dùng booking.id thật, KHÔNG dùng URL param

                // ⚠️ NO Staff query — khách hàng KHÔNG biết tên nhân viên

                // Fetch all services
                const { data: svcs } = await supabase
                    .from('Services')
                    .select('id, nameVN, nameEN, duration')
                    .limit(1000);

                const svcMap = new Map();
                if (svcs) {
                    svcs.forEach((s: any) => {
                        if (s.id) svcMap.set(String(s.id).trim().toLowerCase(), s);
                    });
                }

                const processedItems: ServiceItem[] = [];

                (items || []).forEach((i: any) => {
                    const sId = String(i.serviceId || '').trim().toLowerCase();
                    const svc = svcMap.get(sId);
                    const itemDuration = i.duration || svc?.duration || 60;

                    // Priority: item-level timeStart → booking-level fallback (ONLY if this item's status is active)
                    let computedTimeStart: string | null = null;
                    const activeStatuses = ['IN_PROGRESS', 'COMPLETED', 'CLEANING', 'DONE'];
                    if (i.timeStart) {
                        computedTimeStart = i.timeStart;
                    } else if (booking.timeStart && activeStatuses.includes(i.status)) {
                        // Fallback: chỉ dùng booking.timeStart nếu ITEM NÀY đã bắt đầu
                        // KHÔNG dùng bookingStarted toàn cục → tránh DV chưa bắt đầu cũng đếm ngược
                        computedTimeStart = booking.timeStart;
                    }

                    // Split multi-KTV items: if a BookingItem has multiple technicianCodes,
                    // create separate ServiceItems so each KTV gets their own rating card.
                    const techCodes: string[] = Array.isArray(i.technicianCodes) && i.technicianCodes.length > 0
                        ? i.technicianCodes
                        : [booking.technicianCode || ''];

                    techCodes.forEach((techCode: string, techIdx: number) => {
                        // For multi-KTV: use composite ID so each KTV gets unique rating
                        const itemId = techCodes.length > 1 ? `${i.id}-ktv${techIdx}` : i.id;
                        const ktvRatingsMap: Record<string, number> = i.ktvRatings || {};
                        // Per-KTV rating: use ktvRatings JSONB if available, else fallback to itemRating
                        const perKtvRating = techCodes.length > 1
                            ? (ktvRatingsMap[techCode.trim()] ?? null)
                            : (i.itemRating ?? null);

                        // Per-KTV room/bed: lấy từ segments theo techCode, fallback item-level → booking-level
                        const ktvSegment = Array.isArray(i.segments)
                            ? i.segments.find((s: any) => s.ktvId === techCode)
                            : null;
                        const itemRoomName = ktvSegment?.roomId || i.roomName || booking.roomName || null;
                        const itemBedId = ktvSegment?.bedId || i.bedId || booking.bedId || null;

                        processedItems.push({
                            id: itemId,
                            serviceId: i.serviceId,
                            service_name: svc?.nameVN || svc?.nameEN || `Dịch vụ ${i.serviceId}`,
                            duration: itemDuration,
                            technicianCode: techCode || '',
                            staffName: '',
                            staffAvatar: '',
                            computedTimeStart,
                            quantity: i.quantity || 1,
                            price: i.price || 0,
                            options: i.options,
                            status: i.status || null,
                            itemRating: perKtvRating,
                            itemFeedback: i.itemFeedback ?? null,
                            ktvRatings: ktvRatingsMap,
                            // Per-item room/bed from segments
                            roomName: itemRoomName,
                            bedId: itemBedId,
                        });
                    });
                });

                const totalDuration = processedItems.reduce((acc, item) => acc + item.duration, 0);

                setData({
                    id: booking.id,
                    status: (booking.status as JourneyStatus) || 'PREPARING',
                    timeStart: booking.timeStart || null,
                    timeEnd: booking.timeEnd || null,
                    rating: booking.rating || null,
                    violations: booking.violations || null,
                    tipAmount: booking.tipAmount || null,
                    staffName: '',
                    staffAvatar: '',
                    totalDuration: totalDuration || 60,
                    items: processedItems,
                    roomName: booking.roomName || null,
                    bedId: booking.bedId || null
                });
            } else {

                setError('Không tìm thấy đơn hàng.');
            }
        } catch (err: any) {
            console.error('Error fetching initial journey state:', err);
            setError(err.message || 'Lỗi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchState();

        if (!bookingId) return;

        const supabase = createClient();

        // 2. Subscribe to Realtime Updates — dùng resolvedId (booking.id thật)
        const channel = supabase
            .channel(`journey-tracking-${resolvedId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Bookings',
                    filter: `id=eq.${resolvedId}`,
                },
                (payload: any) => {
                    console.log('[Journey] Booking Realtime Update:', payload.new);
                    const newBooking = payload.new;
                    
                    setData((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            status: (newBooking.status as JourneyStatus) || prev.status,
                            timeStart: newBooking.timeStart !== undefined ? newBooking.timeStart : prev.timeStart,
                            timeEnd: newBooking.timeEnd !== undefined ? newBooking.timeEnd : prev.timeEnd,
                            rating: newBooking.rating !== undefined ? newBooking.rating : prev.rating,
                            violations: newBooking.violations !== undefined ? newBooking.violations : prev.violations,
                            tipAmount: newBooking.tipAmount !== undefined ? newBooking.tipAmount : prev.tipAmount,
                        };
                    });

                    // If staff changed, re-fetch full state to get new staff details
                    if (newBooking.technicianCode) {
                        fetchState();
                    }
                }
            )
            // 🆕 Subscribe BookingItems: detect khi KTV hoàn thành từng DV
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'BookingItems',
                    filter: `bookingId=eq.${resolvedId}`,
                },
                (payload: any) => {
                    console.log('[Journey] BookingItem Realtime Update:', payload.new.id, payload.new.status);
                    const updatedItem = payload.new;
                    
                    setData((prev) => {
                        if (!prev) return prev;
                        // Match composite IDs: 'abc-ktv0' starts with 'abc'
                        const originalId = updatedItem.id;
                        const updatedKtvRatings: Record<string, number> = updatedItem.ktvRatings || {};
                        const updatedItems = prev.items.map(item => {
                            if (item.id === originalId || item.id.startsWith(`${originalId}-ktv`)) {
                                // For multi-KTV split cards: use per-KTV rating from ktvRatings
                                const isComposite = item.id.includes('-ktv');
                                let perKtvRating = updatedItem.itemRating ?? item.itemRating;
                                if (isComposite && item.technicianCode && Object.keys(updatedKtvRatings).length > 0) {
                                    perKtvRating = updatedKtvRatings[item.technicianCode.trim()] ?? item.itemRating;
                                }
                                return {
                                    ...item,
                                    status: updatedItem.status ?? item.status,
                                    itemRating: perKtvRating,
                                    itemFeedback: updatedItem.itemFeedback ?? item.itemFeedback,
                                    ktvRatings: updatedKtvRatings,
                                    computedTimeStart: updatedItem.timeStart ?? item.computedTimeStart,
                                };
                            }
                            return item;
                        });
                        return { ...prev, items: updatedItems };
                    });
                }
            )
            .subscribe((status: any, err?: any) => {
                console.log('[useJourneyRealtime] Subscribe Status:', status);
                if (err) {
                    console.error('[useJourneyRealtime] Subscribe Error:', err);
                }
            });

        // Fallback Polling (Every 5 seconds) just in case Realtime times out or block by network
        const pollInterval = setInterval(() => {
            fetchState();
        }, 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, [bookingId, resolvedId, fetchState]);

    return { data, loading, error, refresh: fetchState };
}
