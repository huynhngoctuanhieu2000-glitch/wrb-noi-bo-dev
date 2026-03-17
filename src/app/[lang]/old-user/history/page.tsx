"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import { formatCurrency } from '@/components/Menu/utils';
import { useMenuData } from '@/components/Menu/MenuContext';

// 🔧 UI CONFIGURATION
const HISTORY_CONFIG = {
    ITEM_BORDER_RADIUS: 'rounded-3xl',
    BOTTOM_BAR_PADDING: 'pb-[calc(1rem+env(safe-area-inset-bottom))]',
    LIST_BOTTOM_PADDING: 'pb-28',
    HEADER_BG: 'bg-[#000000]/90',
    ITEM_BG: 'bg-[#131722]',
    ITEM_BORDER: 'border-[#1f2430]',
};

export default function HistoryPage({ params }: { params: Promise<{ lang: string }> }) {
    const [lang, setLang] = useState<string>('en');
    const [dict, setDict] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { addToCart, clearCart, services } = useMenuData();

    useEffect(() => {
        const init = async () => {
            const p = await params;
            setLang(p.lang);
            const d = getDictionary(p.lang);
            setDict(d);

            // Fetch Data
            try {
                const email = localStorage.getItem('currentUserEmail');
                if (!email) {
                    console.warn("No email found in localStorage");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`/api/orders?email=${email}`);
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    console.error("Failed to fetch orders:", data.error);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [params]);

    // Helper to Restore Cart
    const restoreCart = (order: any) => {
        clearCart();
        // Fix: Check length because [] is truthy
        const itemsToRestore = (order.raw_items && order.raw_items.length > 0)
            ? order.raw_items
            : order.items;

        console.log("Restoring Cart. Available Services:", services.length);
        console.log("Items to restore:", itemsToRestore);

        itemsToRestore.forEach((item: any) => {
            // 1. Try to find service by ID first
            let service = services.find((s: any) => s.id === item.id);

            // 2. Fallback: Find by Name (exact match EN or VN) if ID not found
            if (!service && item.name) {
                const cleanName = item.name.trim().toLowerCase();
                service = services.find(s =>
                    s.names.en.toLowerCase() === cleanName ||
                    s.names.vn.toLowerCase() === cleanName ||
                    s.names.en.toLowerCase() === cleanName // Fallback to whatever name property exists
                );
            }

            console.log(`Checking item ${item.id || item.name} -> Found?`, !!service);

            if (service) {
                // 3. Construct Options
                // If raw_items (has .options), use directly.
                // If processedItems (has flat fields strength/therapist in VN/EN), map back to codes.
                let options = item.options ? { ...item.options } : {};

                if (!item.options) {
                    // Reverse map helper
                    const mapVal = (val: string): any => {
                        if (!val) return undefined;
                        const v = val.toLowerCase();
                        if (v.includes('vừa') || v === 'medium') return 'medium';
                        if (v.includes('lẹ') || v.includes('nhẹ') || v === 'light') return 'light'; // Typo protection
                        if (v.includes('mạnh') || v === 'strong') return 'strong';

                        if (v.includes('nam') || v === 'male') return 'male';
                        if (v.includes('nữ') || v === 'female') return 'female';
                        if (v.includes('ngẫu nhiên') || v === 'random') return 'random';
                        return undefined;
                    };

                    options = {
                        strength: mapVal(item.strength),
                        therapist: mapVal(item.therapist || item.therapist_name), // Screenshot showed therapist_name
                    };
                }

                addToCart(service, item.qty || 1, options);
            } else {
                console.warn(`Service ${item.id || item.name} not found in current menu`);
            }
        });
    };

    const handleCreateNew = () => {
        // Clear cart for new booking
        clearCart();
        // Redirect to Old User -> Select Menu (as requested)
        router.push(`/${lang}/old-user/select-menu`);
    };

    const handleModify = (order: any) => {
        restoreCart(order);
        // Redirect to Menu to edit
        // Default to 'standard' for now as we haven't saved menuType in DB yet
        router.push(`/${lang}/old-user/standard/menu`);
    };

    const handleRebook = (order: any) => {
        restoreCart(order);
        // Redirect to Checkout directly
        router.push(`/${lang}/old-user/standard/checkout`);
    };

    if (!dict) return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white"></div>;


    return (
        <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans">
            {/* Header */}
            <div className={`flex items-center p-4 sticky top-0 ${HISTORY_CONFIG.HEADER_BG} backdrop-blur-md z-20 border-b border-white/5`}>
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-[#1f2430] rounded-full flex items-center justify-center hover:bg-[#2a3040] transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-400" />
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-white pr-10">
                    {dict.history.page_title}
                </h1>
            </div>

            {/* List */}
            <div className={`flex-1 p-4 space-y-4 overflow-y-auto ${HISTORY_CONFIG.LIST_BOTTOM_PADDING}`}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-500 gap-2">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-sm">{dict.history.loading_visits}</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center pt-20 text-gray-500 italic">
                        {dict.history.no_visits}
                    </div>

                ) : (
                    orders.map((visit) => (
                        <div key={visit.id} className={`${HISTORY_CONFIG.ITEM_BG} ${HISTORY_CONFIG.ITEM_BORDER_RADIUS} p-5 border ${HISTORY_CONFIG.ITEM_BORDER}`}>
                            {/* Header Row: Date | ID ---------- Price */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col text-sm">
                                    <span className="font-bold text-gray-400">{visit.date}</span>
                                    <span className="text-gray-600 text-xs">| {visit.id}</span>
                                </div>
                                <div className="font-bold text-[#D4AF37] text-lg">
                                    {formatCurrency(visit.total)} VND
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                                {visit.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-[#D4AF37] font-bold text-xs flex-shrink-0">#{idx + 1}</span>
                                            <span className="font-bold text-white truncate">{item.name || `Dịch vụ ${item.id}`}</span>
                                            {item.duration && (
                                                <span className="text-gray-500 text-xs flex-shrink-0">{item.duration} min</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {item.qty > 1 && <span className="text-gray-500 text-xs">x{item.qty}</span>}
                                            <span className="text-gray-400 text-xs font-medium">{formatCurrency(item.price)} đ</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Staff Info */}
                            {(visit.staffName || visit.technicianCode) && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 border-t border-white/5 pt-3">
                                    <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <span className="font-semibold text-gray-300">{visit.staffName || visit.technicianCode}</span>
                                </div>
                            )}

                            {/* Note */}
                            {visit.note && visit.note !== 'None' && visit.note !== 'Supabase Booking' && (
                                <div className="text-xs text-gray-500 italic mb-5 border-t border-white/5 pt-2">
                                    {dict.history.note_label}: <span className="text-gray-400">{visit.note}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-4">
                                {visit.status === 'DONE' ? (
                                    <>
                                        <button
                                            onClick={() => handleModify(visit)}
                                            className="flex-1 bg-[#252a37] hover:bg-[#2f3545] text-gray-300 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            {dict.history.modify_btn}
                                        </button>
                                        <button
                                            onClick={() => handleRebook(visit)}
                                            className="flex-1 bg-[#B88700] hover:bg-[#D4AF37] text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-900/20"
                                        >
                                            <RefreshCw size={16} strokeWidth={3} />
                                            {dict.history.rebook_btn}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {['NEW', 'PREPARING', 'IN_PROGRESS'].includes(visit.status) ? (
                                            <button
                                                onClick={() => router.push(`/${lang}/journey/${visit.id}`)}
                                                className="flex-1 bg-[#252a37] hover:bg-[#2f3545] text-gray-300 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <ArrowLeft size={16} />
                                                {dict.history.resume_journey_btn}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/${lang}/journey/${visit.id}`)}
                                                className="flex-1 bg-[#B88700] hover:bg-[#D4AF37] text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-900/20"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                {dict.history.feedback_btn}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Button */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 ${HISTORY_CONFIG.BOTTOM_BAR_PADDING} bg-gradient-to-t from-black via-black/90 to-transparent z-20`}>
                <button
                    onClick={handleCreateNew}
                    className="w-full bg-[#1f2430] hover:bg-[#2a3040] border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wide transition-all active:scale-[0.98]"
                >
                    <Plus size={20} />
                    {dict.history.create_new_btn}
                </button>
            </div>
        </div>
    );
}
