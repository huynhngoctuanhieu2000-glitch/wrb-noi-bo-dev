'use client';

import React, { use, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuData } from '@/components/Menu/MenuContext';

import CheckoutHeader from '@/components/Checkout/CheckoutHeader';
import CustomerInfo from '@/components/Checkout/CustomerInfo';
import Invoice from '@/components/Checkout/Invoice';
import PaymentMethods from '@/components/Checkout/PaymentMethods';
import OrderConfirmModal from '@/components/Checkout/OrderConfirmModal';
import CustomForYouModal from '@/components/CustomForYou';
import { ServiceOptions, CartItem } from '@/components/Menu/types';
import { getDictionary } from '@/lib/dictionaries';

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
    const router = useRouter();
    const { cart, updateAllCartItemOptions, updateCartItemOptions } = useMenuData();

    // Unwrap params
    const { lang: rawLang } = use(params);
    const lang = rawLang === 'vn' ? 'vi' : rawLang;

    const dict = getDictionary(lang);

    // --- STATE ---

    // Customer Info
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '', // Will be filled from localStorage
        phone: '',
        gender: 'Male',
        room: ''
    });

    // Payment
    const [paymentMethod, setPaymentMethod] = useState('cash_vnd');
    const [amountPaid, setAmountPaid] = useState<string>('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);

    // --- COMPUTED ---
    const totalVND = useMemo(() => cart.reduce((sum, item) => sum + item.priceVND * item.qty, 0), [cart]);

    const changeAmount = useMemo(() => {
        const paid = parseInt(amountPaid.replace(/\./g, '') || '0', 10);
        return paid - totalVND;
    }, [amountPaid, totalVND]);

    // --- EFFECTS ---
    useEffect(() => {
        if (!cart || cart.length === 0) {
            router.push('/');
        }
    }, [cart, router]);

    // [NEW] Auto-fill Customer Info
    useEffect(() => {
        try {
            const storedInfoIdx = localStorage.getItem('currentUserInfo');
            if (storedInfoIdx) {
                const info = JSON.parse(storedInfoIdx);
                setCustomerInfo(prev => ({
                    ...prev,
                    name: info.name || prev.name,
                    email: info.email || prev.email,
                    phone: info.phone || prev.phone
                }));
            } else {
                // Fallback: try email only
                const email = localStorage.getItem('currentUserEmail');
                if (email) {
                    setCustomerInfo(prev => ({ ...prev, email }));
                }
            }
        } catch (e) {
            console.error("Failed to parse currentUserInfo", e);
        }
    }, []);

    // --- HANDLERS ---
    const handleBack = () => {
        router.back();
    };

    const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setAmountPaid(Number(raw).toLocaleString('vi-VN'));
    };

    const setQuickAmount = (amount: number) => {
        setAmountPaid(amount.toLocaleString('vi-VN'));
    };

    const handleCustomRequest = (item: CartItem) => {
        setSelectedCartItem(item);
        setIsModalOpen(true);
    };

    const handleSaveCustomRequest = (options: ServiceOptions) => {
        if (selectedCartItem) {
            updateCartItemOptions(selectedCartItem.cartId, options);
            setIsModalOpen(false);
        }
    };

    const handleCustomerChange = (field: string, value: string) => {
        setCustomerInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirmOrder = () => {
        if (!customerInfo.name || !customerInfo.email) {
            alert(lang === 'vi' ? 'Vui lòng điền Tên và Email' : 'Please enter Full Name and Email');
            return;
        }
        setIsConfirmOpen(true);
    };

    const handleFinalSubmit = async () => {
        const payload = {
            customer: customerInfo,
            items: cart,
            paymentMethod,
            amountPaid: parseInt(amountPaid.replace(/\./g, '') || '0', 10),
            totalVND,
            lang: lang
        };

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to submit");
        }
    };

    if (!cart) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-black pb-32 font-sans animate-in fade-in duration-500">
            <CheckoutHeader
                title={dict.checkout.title}
                backLabel={dict.common?.back_to_menu}
                onBack={handleBack}
            />

            <main className="p-4 space-y-6 max-w-2xl mx-auto">
                {/* 1. Customer Info */}
                <CustomerInfo
                    lang={lang}
                    dict={dict}
                    info={customerInfo}
                    onChange={handleCustomerChange}
                />

                {/* 2. Invoice */}
                <Invoice
                    cart={cart}
                    lang={lang}
                    dict={dict}
                    onCustomRequest={handleCustomRequest}
                />

                {/* 3. Payment Methods */}
                <PaymentMethods
                    lang={lang}
                    dict={dict}
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                />

                {/* 4. Cash Payment Input */}
                {(paymentMethod === 'cash_vnd' || paymentMethod === 'cash_usd') && (
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                {dict.checkout.amount_paid_title}
                            </h2>
                            <button
                                onClick={() => setAmountPaid('0')}
                                className="text-red-500 text-xs font-bold border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50"
                            >
                                {dict.checkout.reset}
                            </button>
                        </div>

                        {/* Input Large */}
                        <div className="relative">
                            <input
                                type="text"
                                value={amountPaid}
                                onChange={handleAmountPaidChange}
                                placeholder="0"
                                className="w-full text-center text-4xl font-bold text-black border-b-2 border-gray-100 py-4 focus:outline-none focus:border-green-500 transition-colors bg-transparent placeholder-gray-200"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">VND</span>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="flex gap-2 justify-center flex-wrap">
                            {[totalVND, 500000, 1000000].map(amt => (
                                amt > 0 && (
                                    <button
                                        key={amt}
                                        onClick={() => setQuickAmount(amt)}
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all"
                                    >
                                        {amt.toLocaleString('vi-VN')}
                                    </button>
                                )
                            ))}
                        </div>

                        {/* Change Display */}
                        <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-gray-500 text-sm font-medium">{dict.checkout.change_title}</span>
                            <span className={`text-xl font-bold ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {changeAmount >= 0 ? changeAmount.toLocaleString('vi-VN') : dict.checkout.insufficient} VND
                            </span>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Bar - Confirm */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={handleConfirmOrder}
                        className="w-full py-4 bg-[#0f172a] text-white font-bold uppercase rounded-xl shadow-lg hover:bg-[#1e293b] transition-colors text-lg"
                    >
                        {dict.checkout.confirm_order_btn}
                    </button>
                </div>
            </div>

            {/* Modals */}
            {selectedCartItem && (
                <CustomForYouModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCustomRequest}
                    lang={lang as any}
                    serviceData={{
                        ID: selectedCartItem.id,
                        NAMES: selectedCartItem.names as any,
                        FOCUS_POSITION: selectedCartItem.FOCUS_POSITION as any,
                        TAGS: selectedCartItem.TAGS as any,
                        SHOW_STRENGTH: selectedCartItem.SHOW_STRENGTH,
                        HINT: selectedCartItem.HINT as any
                    }}
                    initialData={selectedCartItem.options as any}
                />
            )}

            <OrderConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleFinalSubmit}
                lang={lang}
                dict={dict}
                cart={cart}
                customerInfo={customerInfo}
                paymentMethod={paymentMethod}
                amountPaid={parseInt(amountPaid.replace(/\./g, '') || '0', 10)}
            />
        </div>
    );
}
