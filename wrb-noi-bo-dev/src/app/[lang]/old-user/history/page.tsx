"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import { formatCurrency } from '@/components/Menu/utils';
import { useMenuData } from '@/components/Menu/MenuContext';

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
            // Find service in current menu data to get full details (images, etc)
            const service = services.find((s: any) => s.id === item.id);
            console.log(`Checking item ${item.id} -> Found?`, !!service);

            if (service) {
                addToCart(service, item.qty, item.options);
            } else {
                // Fallback if service not found (maybe deleted?), still try to add minimal info if possible
                // But addToCart needs Service object. If not found, skip or warn.
                console.warn(`Service ${item.id} not found in current menu`);
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

    if (!dict) return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">Loading Dictionary...</div>;

    return (
        <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center p-4 sticky top-0 bg-[#000000]/90 backdrop-blur-md z-20 border-b border-white/5">
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
            <div className="flex-1 p-4 pb-28 space-y-4 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-500 gap-2">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-sm">Loading visits...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center pt-20 text-gray-500 italic">
                        No visits found.
                    </div>
                ) : (
                    orders.map((visit) => (
                        <div key={visit.id} className="bg-[#131722] rounded-3xl p-5 border border-[#1f2430]">
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
                            <div className="space-y-1 mb-4">
                                {visit.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 font-bold text-sm text-white">
                                        <span className="text-gray-500">•</span>
                                        <span>{item.name}</span>
                                        {item.qty > 1 && <span className="text-gray-500 text-xs">x{item.qty}</span>}
                                    </div>
                                ))}
                            </div>

                            {/* Note */}
                            {visit.note && visit.note !== 'None' && (
                                <div className="text-xs text-gray-500 italic mb-5 border-t border-white/5 pt-2">
                                    {dict.history.note_label}: <span className="text-gray-400">{visit.note}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
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
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
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
