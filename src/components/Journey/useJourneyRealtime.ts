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
                // Fetch Staff details if technicianCode exists
                let staffName = '';
                let staffAvatar = '';
                
                if (booking.technicianCode) {
                    staffName = booking.technicianCode; // Fallback to code
                    
                    const { data: staffData, error: staffError } = await supabase
                        .from('Staff')
                        .select('avatar_url, fullName')
                        .eq('id', booking.technicianCode)
                        .maybeSingle();
                        
                    if (staffError) {
                        console.warn('Error fetching staff member:', staffError);
                    }

                    if (staffData) {
                        staffAvatar = staffData.avatar_url;
                        if (staffData.fullName) staffName = staffData.fullName;
                    }
                }

                const { data: items } = await supabase
                    .from('BookingItems')
                    .select('*')
                    .eq('bookingId', bookingId);

                // Fetch all services to map info (consistent with KTV app survival strategy)
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
                const itemCount = (items || []).length;

                (items || []).forEach((i: any) => {
                    const sId = String(i.serviceId || '').trim().toLowerCase();
                    const svc = svcMap.get(sId);
                    const itemDuration = i.duration || svc?.duration || 60;

                    // Priority: use item-level timeStart from DB (KTV app sets this per-item)
                    // Fallback: use booking-level timeStart for all items
                    let computedTimeStart: string | null = null;

                    if (i.timeStart) {
                        // Item has its own start time (set by KTV when they start this specific service)
                        computedTimeStart = i.timeStart;
                    } else if (booking.timeStart) {
                        // Fallback: all services share booking-level timeStart
                        computedTimeStart = booking.timeStart;
                    }

                    processedItems.push({
                        id: i.id,
                        serviceId: i.serviceId,
                        service_name: svc?.nameVN || svc?.nameEN || `Dịch vụ ${i.serviceId}`,
                        duration: itemDuration,
                        technicianCode: i.technicianCode || booking.technicianCode || '',
                        staffName: staffName,
                        staffAvatar: staffAvatar,
                        computedTimeStart,
                        quantity: i.quantity || 1,
                        price: i.price || 0,
                        options: i.options,
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
                    staffName: staffName || '',
                    staffAvatar,
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
                    console.log('Realtime Update Received:', payload.new);
                    const newBooking = payload.new;
                    
                    // If technicianCode changed, we might need a full refresh
                    // But for simplicity and reactivity, fetchState will be called by polling anyway
                    // Or we can manually trigger a fetch for staff if technicianCode changed
                    
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
