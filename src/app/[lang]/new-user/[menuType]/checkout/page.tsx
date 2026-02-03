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
    // Explicitly normalize 'vn' -> 'vi' here to be absolutely sure
    const lang = rawLang === 'vn' ? 'vi' : rawLang;

    console.log('[CheckoutPage] resolved lang:', lang);
    const dict = getDictionary(lang);
    console.log('[CheckoutPage] dict title:', dict?.checkout?.title);

    // Helper to translate options (strength, therapist)
    const tOption = (category: string, value: string) => {
        if (!value) return '';
        // @ts-ignore
        return dict.options?.[category]?.[value.toLowerCase()] || value;
    };

    // --- STATE ---

    // Customer Info
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'Male', // Default or could be empty
        room: ''
    });

    // Payment
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amountPaid, setAmountPaid] = useState<string>('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);

    // --- COMPUTED ---
    const currency = useMemo(() => paymentMethod === 'cash_usd' ? 'USD' : 'VND', [paymentMethod]);

    const totalVND = useMemo(() => cart.reduce((sum, item) => sum + item.priceVND * item.qty, 0), [cart]);
    const totalUSD = useMemo(() => cart.reduce((sum, item) => sum + item.priceUSD * item.qty, 0), [cart]);

    const changeAmount = useMemo(() => {
        const rawPaid = parseInt(amountPaid.replace(/\./g, '') || '0', 10);
        if (currency === 'USD') {
            return rawPaid - totalUSD;
        }
        return rawPaid - totalVND;
    }, [amountPaid, totalVND, totalUSD, currency]);

    // --- EFFECTS ---
    useEffect(() => {
        if (!cart || cart.length === 0) {
            router.push('/');
        }
    }, [cart, router]);

    // Reset amount paid when payment method changes
    useEffect(() => {
        setAmountPaid('');
    }, [paymentMethod]);

    // --- HANDLERS ---
    const handleBack = () => {
        router.back();
    };

    const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // If USD, just allow numbers, no dots formatting needed for small amounts (usually) 
        // OR standard check.
        const raw = e.target.value.replace(/\D/g, '');
        if (!raw) {
            setAmountPaid('');
            return;
        }

        if (currency === 'USD') {
            setAmountPaid(raw); // Simple number
        } else {
            setAmountPaid(Number(raw).toLocaleString('vi-VN'));
        }
    };

    const setQuickAmount = (amount: number) => {
        if (currency === 'USD') {
            setAmountPaid(amount.toString());
        } else {
            setAmountPaid(amount.toLocaleString('vi-VN'));
        }
    };

    // ... (Custom Request Handlers remain same) ...
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
        if (!paymentMethod) {
            alert(lang === 'vi' ? 'Vui lòng chọn phương thức thanh toán' : 'Please select a payment method');
            return;
        }
        setIsConfirmOpen(true);
    };

    // ... (Final Submit remains same) ...
    const handleFinalSubmit = async () => {
        const payload = {
            customer: customerInfo,
            items: cart,
            paymentMethod,
            amountPaid: parseInt(amountPaid.replace(/\./g, '') || '0', 10),
            totalVND, // Keep for legacy backend compatibility
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

    // Quick Suggestions Logic
    const quickSuggestions = currency === 'USD'
        ? [totalUSD, 50, 100, 200]
        : [totalVND, 500000, 1000000];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-black pb-32 font-sans animate-in fade-in duration-500">
            <CheckoutHeader
                title={dict.checkout.title}
                backLabel={dict.common?.back_to_menu}
                onBack={handleBack}
            />

            <main className="p-4 lg:p-8 max-w-6xl mx-auto min-h-screen">
                <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8">

                    {/* 1. Customer Info (Mobile: Item 1, Desktop: Left Col Row 1) */}
                    <div className="w-full lg:col-span-7 lg:row-start-1">
                        <CustomerInfo
                            lang={lang}
                            dict={dict}
                            info={customerInfo}
                            onChange={handleCustomerChange}
                        />
                    </div>

                    {/* 2. Invoice (Mobile: Item 2, Desktop: Right Col Row 1-Span-2) */}
                    {/* Moved UP in DOM to ensure it appears 2nd on mobile */}
                    <div className="w-full lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 space-y-6">
                        <div className="lg:sticky lg:top-4">
                            {/* 2. Invoice */}
                            <Invoice
                                cart={cart}
                                lang={lang}
                                dict={dict}
                                currency={currency} // Pass currency
                                onCustomRequest={handleCustomRequest}
                            />

                            {/* Desktop Confirm Button (Hidden on Mobile) */}
                            <div className="hidden lg:block mt-6">
                                <button
                                    onClick={handleConfirmOrder}
                                    className="w-full py-4 bg-[#0f172a] text-white font-bold uppercase rounded-xl shadow-lg hover:bg-[#1e293b] transition-colors text-lg"
                                >
                                    {dict.checkout.confirm_order_btn}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Payment Section (Mobile: Item 3, Desktop: Left Col Row 2) */}
                    <div className="w-full lg:col-span-7 lg:row-start-2 lg:mt-6 space-y-6">
                        <PaymentMethods
                            lang={lang}
                            dict={dict}
                            selected={paymentMethod}
                            onChange={setPaymentMethod}
                        />

                        {/* Cash Payment Input */}
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
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">
                                        {currency}
                                    </span>
                                </div>

                                {/* Quick Suggestions */}
                                <div className="flex gap-2 justify-center flex-wrap">
                                    {quickSuggestions.map(amt => (
                                        amt > 0 && (
                                            <button
                                                key={amt}
                                                onClick={() => setQuickAmount(amt)}
                                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all"
                                            >
                                                {currency === 'USD' ? amt : amt.toLocaleString('vi-VN')}
                                            </button>
                                        )
                                    ))}
                                </div>

                                {/* Change Display */}
                                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm font-medium">{dict.checkout.change_title}</span>
                                    {changeAmount >= 0 ? (
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-green-600 block">
                                                {changeAmount.toLocaleString('vi-VN')} {currency}
                                            </span>
                                            {/* Conversion Display for USD */}
                                            {currency === 'USD' && (
                                                <span className="text-green-700 font-bold text-lg block">
                                                    = {(changeAmount * 24000).toLocaleString('vi-VN')} VND
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold text-red-500">
                                            {dict.checkout.insufficient}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Bar - Confirm (Hidden on Desktop) */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] lg:hidden">
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
