import React, { useState } from 'react';
import { PencilLine, Wand2, Check, GripHorizontal, User, HeartPulse, Ban, Hand, AlertCircle } from 'lucide-react';
import { CartItem } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface InvoiceProps {
    cart: CartItem[];
    lang: string;
    dict: any;
    currency?: 'VND' | 'USD';
    onCustomRequest: (item: CartItem) => void;
}

export default function Invoice({ cart, lang, dict, currency = 'VND', onCustomRequest }: InvoiceProps) {
    const total = cart.reduce((sum, item) => sum + ((currency === 'USD' ? item.priceUSD : item.priceVND) * item.qty), 0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowWarningModal(false);
            setIsClosing(false);
        }, 200);
    };

    return (
        <div className="space-y-4">
            {/* Gold Banner (Clickable) */}
            <div
                className="bg-[#0d0d0d] border border-white/10 p-3 rounded-xl flex items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowWarningModal(true)}
            >
                <span className="text-[#C9A96E] font-bold text-sm">*{dict.checkout.pay_warning}</span>
            </div>

            <div className="bg-[#1c1c1e] text-white p-5 rounded-3xl shadow-sm border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[#C9A96E] font-bold text-lg">{dict.checkout.invoice_details}</h2>
                    {/* Bỏ `#INV-001` placeholder theo yêu cầu của người dùng */}
                </div>

                {/* List Items */}
                <div className="space-y-8 mb-8">
                    {cart.map((item, idx) => {
                        // 1. Determine effective values (Defaults if missing)
                        const strength = item.options?.strength || 'medium';
                        const therapist = item.options?.therapist || 'random';

                        // 2. Strict Check for "Customized" status
                        const isStrengthCustom = strength !== 'medium';
                        const isTherapistCustom = therapist !== 'random';
                        const isBodyCustom = item.options?.bodyParts && (item.options.bodyParts.focus.length > 0 || item.options.bodyParts.avoid.length > 0);
                        const isNotesCustom = item.options?.notes && (item.options.notes.tag0 || item.options.notes.tag1 || item.options.notes.content);

                        const hasCustom = isStrengthCustom || isTherapistCustom || isBodyCustom || isNotesCustom;

                        // Total body parts count (must match BodyMap.tsx ALL_BODY_PARTS)
                        const TOTAL_BODY_PARTS = 8; // HEAD, NECK, SHOULDER, ARM, BACK, THIGH, CALF, FOOT

                        const formatParts = (parts: string[]) => {
                            // Task E1: Show "Full Body" if all parts selected
                            if (parts.length >= TOTAL_BODY_PARTS) {
                                return dict.custom_for_you?.full_body || 'Full Body';
                            }
                            return parts.map(p => {
                                const key = p.toLowerCase();
                                // @ts-ignore
                                return dict.body_parts?.[key] || dict.body_parts?.[p] || p;
                            }).join(', ');
                        };

                        // Helper for colors
                        const getStrengthColor = (s: string) => {
                            switch (s?.toLowerCase()) {
                                case 'light': return 'text-green-500';
                                case 'strong': return 'text-red-500';
                                case 'medium': default: return 'text-[#C9A96E]';
                            }
                        };

                        const getTherapistColor = (t: string) => {
                            switch (t?.toLowerCase()) {
                                case 'male': return 'text-blue-500';
                                case 'female': return 'text-purple-400';
                                case 'random': default: return 'text-green-500';
                            }
                        };

                        return (
                            <div key={item.cartId} className="border border-white/10 rounded-2xl p-4 shadow-sm bg-[#0d0d0d] mb-4">
                                {/* Row 1: Name + Price */}
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-white font-bold text-lg">{idx + 1}. {item.names[lang] || item.names.en}</h4>
                                    <span className={`font-bold text-lg ${currency === 'USD' ? 'text-orange-500' : 'text-[#C9A96E]'}`}>
                                        {currency === 'USD'
                                            ? `${(item.priceUSD * item.qty)} USD`
                                            : `${formatCurrency(item.priceVND * item.qty)} VND`
                                        }
                                    </span>
                                </div>

                                {/* Row 2: Duration */}
                                {item.timeValue > 0 && (
                                    <div className="text-gray-400 text-sm font-medium mb-3 border-b border-dashed border-white/10 pb-3">
                                        {item.timeValue}mins
                                    </div>
                                )}

                                {/* Clickable Customization Region */}
                                <div 
                                    className="mt-1 p-3 bg-black/30 rounded-xl border border-white/5 space-y-2.5 cursor-pointer hover:bg-black/40 active:scale-[0.99] transition-all text-sm mb-1"
                                    onClick={() => onCustomRequest(item)}
                                >
                                    {/* Strength */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 flex justify-center"><Hand size={16} className="text-gray-400" /></div>
                                        <span className="font-bold text-gray-400 w-24">{dict.checkout.strength_label}</span>
                                        <span className="text-gray-500 mx-1">|</span>
                                        <span className={`font-bold capitalize ${getStrengthColor(strength)}`}>
                                            {dict.options?.strength_levels?.[strength?.toLowerCase()] || strength}
                                        </span>
                                    </div>

                                    {/* Therapist */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 flex justify-center"><User size={16} className="text-gray-400" /></div>
                                        <span className="font-bold text-gray-400 w-24">{dict.checkout.therapist_label}</span>
                                        <span className="text-gray-500 mx-1">|</span>
                                        <span className={`font-bold capitalize ${getTherapistColor(therapist)}`}>
                                            {dict.options?.therapist_options?.[therapist?.toLowerCase()] || therapist}
                                        </span>
                                    </div>

                                    {/* Focus */}
                                    {item.options?.bodyParts?.focus && item.options.bodyParts.focus.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 flex justify-center mt-0.5"><HeartPulse size={16} className="text-gray-400" /></div>
                                            <span className="font-bold text-gray-400 w-24 shrink-0">{dict.checkout.focus}:</span>
                                            <span className="text-green-500 font-bold leading-tight mt-0.5">
                                                {formatParts(item.options.bodyParts.focus)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Avoid */}
                                    {item.options?.bodyParts?.avoid && item.options.bodyParts.avoid.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 flex justify-center mt-0.5"><Ban size={16} className="text-gray-400" /></div>
                                            <span className="font-bold text-gray-400 w-24 shrink-0">{dict.checkout.avoid}:</span>
                                            <span className="text-red-500 font-bold leading-tight mt-0.5">
                                                {formatParts(item.options.bodyParts.avoid)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Tags & Note Content - Footer */}
                                    {item.options?.notes && (item.options.notes.tag0 || item.options.notes.tag1 || item.options.notes.content) && (
                                        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                                            {/* Tags */}
                                            {(item.options.notes.tag0 || item.options.notes.tag1) && (
                                                <div className="flex gap-2">
                                                    {item.options.notes.tag0 && (
                                                        <span className="bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] px-2 py-1 rounded border border-[#C9A96E]/30 font-bold uppercase">
                                                            {dict.tags?.pregnant || 'Pregnant'}
                                                        </span>
                                                    )}
                                                    {item.options.notes.tag1 && (
                                                        <span className="bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] px-2 py-1 rounded border border-[#C9A96E]/30 font-bold uppercase">
                                                            {dict.tags?.allergy || 'Allergy'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {/* Note Content */}
                                            {item.options.notes.content && (
                                                <div className="text-gray-300 italic text-xs bg-white/5 p-2 rounded border border-white/5">
                                                    <span className="font-bold not-italic text-gray-400 mr-1">{dict.history?.note_label || 'Note'}:</span>
                                                    {item.options.notes.content}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Total Divider */}
                <div className="h-0 border-t-2 border-dashed border-white/10 my-6"></div>

                {/* Total */}
                <div className="flex justify-between items-baseline">
                    <span className="text-white font-bold text-lg">Total</span>
                    <div className="text-right">
                        <span className={`block text-3xl font-black ${currency === 'USD' ? 'text-orange-500' : 'text-[#C9A96E]'}`}>
                            {currency === 'USD'
                                ? `${total} USD`
                                : `${formatCurrency(total)} VND`
                            }
                        </span>
                        <div className="text-xs text-gray-500 italic mt-1">*Price includes VAT</div>
                    </div>
                </div>
            </div>

            {/* Regulation Popup */}
            {showWarningModal && (
                <div
                    className={`fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in duration-200'}`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-[#1c1c1e] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/5 p-6 flex flex-col items-center text-center gap-4 ${isClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95 duration-200'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mb-1">
                            <AlertCircle size={32} className="text-[#C9A96E]" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-[#C9A96E] leading-tight">
                            {dict.payment_methods?.payment_regulation?.title || "Payment Regulation"}
                        </h3>

                        {/* Content */}
                        <p className="text-gray-400 text-[15px] leading-relaxed">
                            {dict.payment_methods?.payment_regulation?.content || "We collect fees before service."}
                        </p>

                        {/* Button */}
                        <button
                            onClick={closeModal}
                            className="w-full bg-[#C9A96E] hover:bg-[#b09461] text-black font-bold py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-[#C9A96E]/20 mt-2"
                        >
                            {dict.payment_methods?.payment_regulation?.btn || "UNDERSTOOD"}
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
}
