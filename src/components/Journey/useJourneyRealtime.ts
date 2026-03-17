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
    computedTimeStart: string | null; // ISO string - sequential offset from booking timeStart
    quantity: number;
    price: number;
    options?: any;
    // Per-item completion & rating fields
    status: string | null; // 'IN_PROGRESS' | 'COMPLETED' | 'DONE' etc.
    itemRating: number | null;
    itemFeedback: string | null;
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
                const { data: items } = await supabase
                    .from('BookingItems')
                    .select('*')
                    .eq('bookingId', bookingId);

                // Collect all unique technicianCodes (item-level + booking-level fallback)
                const techCodes = new Set<string>();
                (items || []).forEach((i: any) => {
                    if (i.technicianCode) techCodes.add(i.technicianCode);
                });
                if (booking.technicianCode) techCodes.add(booking.technicianCode);

                // Fetch all staff details in ONE query
                const staffMap = new Map<string, { fullName: string; avatar_url: string }>();
                if (techCodes.size > 0) {
                    const { data: staffList } = await supabase
                        .from('Staff')
                        .select('id, fullName, avatar_url')
                        .in('id', Array.from(techCodes));

                    if (staffList) {
                        staffList.forEach((s: any) => {
                            staffMap.set(s.id, { fullName: s.fullName || s.id, avatar_url: s.avatar_url || '' });
                        });
                    }
                }

                // Booking-level fallback staff
                const bookingStaff = staffMap.get(booking.technicianCode);
                const fallbackStaffName = bookingStaff?.fullName || booking.technicianCode || '';
                const fallbackStaffAvatar = bookingStaff?.avatar_url || '';

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

                    // Per-item staff — each item has its own assigned KTV
                    const itemTechCode = i.technicianCode || booking.technicianCode || '';
                    const itemStaff = staffMap.get(itemTechCode);
                    const itemStaffName = itemStaff?.fullName || itemTechCode;
                    const itemStaffAvatar = itemStaff?.avatar_url || '';

                    // Priority: item-level timeStart → booking-level
                    let computedTimeStart: string | null = null;
                    if (i.timeStart) {
                        computedTimeStart = i.timeStart;
                    } else if (booking.timeStart) {
                        computedTimeStart = booking.timeStart;
                    }

                    processedItems.push({
                        id: i.id,
                        serviceId: i.serviceId,
                        service_name: svc?.nameVN || svc?.nameEN || `Dịch vụ ${i.serviceId}`,
                        duration: itemDuration,
                        technicianCode: itemTechCode,
                        staffName: itemStaffName,
                        staffAvatar: itemStaffAvatar,
                        computedTimeStart,
                        quantity: i.quantity || 1,
                        price: i.price || 0,
                        options: i.options,
                        status: i.status || null,
                        itemRating: i.itemRating ?? null,
                        itemFeedback: i.itemFeedback ?? null,
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
                    staffName: fallbackStaffName,
                    staffAvatar: fallbackStaffAvatar,
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

        // 2. Subscribe to Realtime Updates
        const channel = supabase
            .channel(`journey-tracking-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Bookings',
                    filter: `id=eq.${bookingId}`,
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
                    filter: `bookingId=eq.${bookingId}`,
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
    }, [bookingId, fetchState]);

    return { data, loading, error, refresh: fetchState };
}
