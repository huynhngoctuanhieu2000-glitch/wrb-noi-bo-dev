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
                .or(`id.eq.${bookingId},billCode.eq.${bookingId}`)
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

                    processedItems.push({
                        id: i.id,
                        serviceId: i.serviceId,
                        service_name: svc?.nameVN || svc?.nameEN || `Dịch vụ ${i.serviceId}`,
                        duration: itemDuration,
                        technicianCode: (Array.isArray(i.technicianCodes) && i.technicianCodes[0]) || booking.technicianCode || '',
                        staffName: '',
                        staffAvatar: '',
                        computedTimeStart,
                        quantity: i.quantity || 1,
                        price: i.price || 0,
                        options: i.options,
                        status: i.status || null,
                        itemRating: i.itemRating ?? null,
                        itemFeedback: i.itemFeedback ?? null,
                        // Per-item room/bed, fallback về booking-level
                        roomName: i.roomName || booking.roomName || null,
                        bedId: i.bedId || booking.bedId || null,
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
                (payload) => {
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
                (payload) => {
                    console.log('[Journey] BookingItem Realtime Update:', payload.new.id, payload.new.status);
                    const updatedItem = payload.new;
                    
                    setData((prev) => {
                        if (!prev) return prev;
                        const updatedItems = prev.items.map(item =>
                            item.id === updatedItem.id
                                ? {
                                    ...item,
                                    status: updatedItem.status ?? item.status,
                                    itemRating: updatedItem.itemRating ?? item.itemRating,
                                    itemFeedback: updatedItem.itemFeedback ?? item.itemFeedback,
                                    // Cập nhật timeStart khi KTV bắt đầu DV
                                    computedTimeStart: updatedItem.timeStart ?? item.computedTimeStart,
                                }
                                : item
                        );
                        return { ...prev, items: updatedItems };
                    });
                }
            )
            .subscribe((status, err) => {
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
