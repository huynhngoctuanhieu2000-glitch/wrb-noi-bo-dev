'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import PaymentMethods from '@/components/Checkout/PaymentMethods';
import ChangeDenominationSelector from '@/components/Checkout/ChangeDenominationSelector';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: (data: { paymentMethod: string; amountPaid: string; changeDenominations: number[] }) => void;
    lang: string;
    dict: any;
    totalVND: number;
    totalUSD: number;
}

export default function PaymentModal({
    isOpen,
    onClose,
    onNext,
    lang,
    dict,
    totalVND,
    totalUSD
}: PaymentModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // State for payment picking
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amountPaid, setAmountPaid] = useState<string>('');
    const [changeDenominations, setChangeDenominations] = useState<number[]>([]);

    const currency = useMemo(() => paymentMethod === 'cash_usd' ? 'USD' : 'VND', [paymentMethod]);

    const changeAmount = useMemo(() => {
        const rawPaid = parseInt(amountPaid.replace(/\./g, '') || '0', 10);
        if (currency === 'USD') {
            return rawPaid - totalUSD;
        }
        return rawPaid - totalVND;
    }, [amountPaid, totalVND, totalUSD, currency]);

    const quickSuggestions = currency === 'USD'
        ? [totalUSD, 50, 100, 200]
        : [totalVND, 500000, 1000000];

    // Reset amount when changing method
    useEffect(() => {
        setAmountPaid('');
    }, [paymentMethod]);

    // Reset denominations when amount changes
    useEffect(() => {
        setChangeDenominations([]);
    }, [amountPaid]);

    // Modal Animation logic
    useEffect(() => {
        if (isOpen) {
            setIsVisible(false);
            setIsClosing(false);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            // reset on real close
            setPaymentMethod('');
            setAmountPaid('');
            setChangeDenominations([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (!raw) {
            setAmountPaid('');
            return;
        }

        if (currency === 'USD') {
            setAmountPaid(raw);
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

    const handleConfirmNext = () => {
        if (!paymentMethod) {
            alert(dict.checkout?.alerts?.select_payment || 'Please select a payment method');
            return;
        }
        
        // Pass data up to Checkout Page state
        onNext({
            paymentMethod,
            amountPaid,
            changeDenominations
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className={`
                relative w-full max-w-lg bg-[#f8fafc] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col
                transform transition-transform duration-300
                pb-safe max-h-[90vh]
                ${(isClosing || !isVisible) ? 'translate-y-full sm:scale-95 sm:translate-y-0 sm:opacity-0' : 'translate-y-0 sm:scale-100 sm:opacity-100'}
            `}>
                
                {/* Header handle bar (Mobile) */}
                <div className="w-full flex justify-center pt-3 pb-2 sm:hidden bg-white rounded-t-3xl">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">{dict.checkout?.payment_method_title || 'Thanh toán'}</h2>
                    <button 
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    <PaymentMethods
                        lang={lang}
                        dict={dict}
                        selected={paymentMethod}
                        onChange={setPaymentMethod}
                    />

                    {/* Cash Payment Input Block */}
                    {(paymentMethod === 'cash_vnd' || paymentMethod === 'cash_usd') && (
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    {dict.checkout?.amount_paid_title || 'Amount Paid'}
                                </h3>
                                <button
                                    onClick={() => setAmountPaid('0')}
                                    className="text-red-500 text-xs font-bold border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    {dict.checkout?.reset || 'Reset'}
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
                                <span className="text-gray-500 text-sm font-medium">{dict.checkout?.change_title || 'Change:'}</span>
                                {changeAmount >= 0 ? (
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-green-600 block">
                                            {changeAmount.toLocaleString('vi-VN')} {currency}
                                        </span>
                                        {currency === 'USD' && (
                                            <span className="text-green-700 font-bold text-lg block mt-1">
                                                = {(changeAmount * 24000).toLocaleString('vi-VN')} VND
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xl font-bold text-red-500">
                                        {dict.checkout?.insufficient || 'Insufficient'}
                                    </span>
                                )}
                            </div>

                            {/* Change Denomination Selector */}
                            {changeAmount > 0 && (
                                <ChangeDenominationSelector
                                    changeAmount={changeAmount}
                                    currency={currency as 'VND' | 'USD'}
                                    dict={dict}
                                    onSelect={setChangeDenominations}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                    <button
                        onClick={handleConfirmNext}
                        className="w-full py-4 bg-[#0f172a] text-white font-bold uppercase rounded-xl shadow-lg shadow-gray-900/10 hover:bg-[#1e293b] active:scale-[0.98] transition-all text-lg"
                    >
                        {dict.checkout?.continue || 'TIẾP TỤC'}
                    </button>
                </div>
            </div>
        </div>
    );
}
