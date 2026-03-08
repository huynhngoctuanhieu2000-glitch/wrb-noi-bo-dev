import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

export type JourneyStatus = 'NEW' | 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'FEEDBACK' | 'DONE';

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
    items: any[];
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
                .eq('id', bookingId)
                .single();

            if (fetchError) throw fetchError;

            if (booking) {
                // Fetch Staff details if technicianCode exists
                let staffName = '';
                let staffAvatar = '';
                
                if (booking.technicianCode) {
                    const { data: staffData } = await supabase
                        .from('Staff')
                        .select('full_name, avatar_url')
                        .eq('id', booking.technicianCode)
                        .single();
                        
                    if (staffData) {
                        staffName = staffData.full_name;
                        staffAvatar = staffData.avatar_url;
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

                const processedItems = (items || []).map((i: any) => {
                    const sId = String(i.serviceId || '').trim().toLowerCase();
                    const svc = svcMap.get(sId);
                    return {
                        ...i,
                        service_name: svc?.nameVN || svc?.nameEN || `Dịch vụ ${i.serviceId}`,
                        duration: i.duration || svc?.duration || 60
                    };
                });

                const totalDuration = processedItems.reduce((acc: number, item: any) => acc + item.duration, 0);

                setData({
                    id: booking.id,
                    status: (booking.status as JourneyStatus) || 'PREPARING',
                    timeStart: booking.timeStart || null,
                    timeEnd: booking.timeEnd || null,
                    rating: booking.rating || null,
                    violations: booking.violations || null,
                    tipAmount: booking.tipAmount || null,
                    staffName,
                    staffAvatar,
                    totalDuration: totalDuration || 60,
                    items: processedItems
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
