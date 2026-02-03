import React from 'react';
import { PencilLine, Wand2, Check, GripHorizontal, User, HeartPulse, Ban, Hand } from 'lucide-react';
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

    return (
        <div className="space-y-4">
            {/* Green Banner */}
            <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-center text-center">
                <span className="text-green-700 font-bold text-sm">*{dict.checkout.pay_warning}</span>
            </div>

            <div className="bg-white text-black p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-gray-800 font-bold text-lg">{dict.checkout.invoice_details}</h2>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">#INV-001</span>
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

                        const formatParts = (parts: string[]) => parts.map(p => {
                            // Try exact match, or lowercase match, or uppercase match
                            const key = p.toLowerCase();
                            // @ts-ignore
                            return dict.body_parts?.[key] || dict.body_parts?.[p] || p;
                        }).join(', ');

                        // Helper for colors
                        const getStrengthColor = (s: string) => {
                            switch (s?.toLowerCase()) {
                                case 'light': return 'text-green-700';
                                case 'strong': return 'text-red-700';
                                case 'medium': default: return 'text-yellow-700';
                            }
                        };

                        const getTherapistColor = (t: string) => {
                            switch (t?.toLowerCase()) {
                                case 'male': return 'text-blue-700';
                                case 'female': return 'text-purple-700';
                                case 'random': default: return 'text-green-700';
                            }
                        };

                        return (
                            <div key={item.cartId} className="border border-gray-100 rounded-2xl p-4 shadow-sm bg-white mb-4">
                                {/* Row 1: Name + Price */}
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-black font-bold text-lg">{idx + 1}. {item.names[lang] || item.names.en}</h4>
                                    <span className={`font-bold text-lg ${currency === 'USD' ? 'text-orange-600' : 'text-yellow-600'}`}>
                                        {currency === 'USD'
                                            ? `${(item.priceUSD * item.qty)} USD`
                                            : `${formatCurrency(item.priceVND * item.qty)} VND`
                                        }
                                    </span>
                                </div>

                                {/* Row 2: Duration */}
                                <div className="text-gray-400 text-sm font-medium mb-3 border-b border-dashed border-gray-100 pb-3">
                                    {item.timeValue}mins
                                </div>

                                {/* Vertical Attributes Stack */}
                                <div className="space-y-2 text-sm">
                                    {/* Strength */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 flex justify-center"><Hand size={16} className="text-gray-400" /></div>
                                        <span className="font-bold text-gray-500 w-24">{dict.checkout.strength_label}</span>
                                        <span className="text-gray-300 mx-1">|</span>
                                        <span className={`font-bold capitalize ${getStrengthColor(strength)}`}>
                                            {dict.options?.strength_levels?.[strength?.toLowerCase()] || strength}
                                        </span>
                                    </div>

                                    {/* Therapist */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 flex justify-center"><User size={16} className="text-purple-400" /></div>
                                        <span className="font-bold text-gray-500 w-24">{dict.checkout.therapist_label}</span>
                                        <span className="text-gray-300 mx-1">|</span>
                                        <span className={`font-bold capitalize ${getTherapistColor(therapist)}`}>
                                            {dict.options?.therapist_options?.[therapist?.toLowerCase()] || therapist}
                                        </span>
                                    </div>

                                    {/* Focus */}
                                    {item.options?.bodyParts?.focus && item.options.bodyParts.focus.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 flex justify-center mt-0.5"><HeartPulse size={16} className="text-green-600" /></div>
                                            <span className="font-bold text-green-600 w-24 shrink-0">{dict.checkout.focus}:</span>
                                            <span className="text-green-600 font-medium leading-tight">
                                                {formatParts(item.options.bodyParts.focus)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Avoid */}
                                    {item.options?.bodyParts?.avoid && item.options.bodyParts.avoid.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 flex justify-center mt-0.5"><Ban size={16} className="text-red-500" /></div>
                                            <span className="font-bold text-red-500 w-24 shrink-0">{dict.checkout.avoid}:</span>
                                            <span className="text-red-500 font-medium leading-tight">
                                                {formatParts(item.options.bodyParts.avoid)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Tags & Note Content - Footer */}
                                {item.options?.notes && (item.options.notes.tag0 || item.options.notes.tag1 || item.options.notes.content) && (
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-2">
                                        {/* Tags */}
                                        {(item.options.notes.tag0 || item.options.notes.tag1) && (
                                            <div className="flex gap-2">
                                                {item.options.notes.tag0 && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-[11px] px-2 py-1 rounded font-bold">
                                                        {dict.tags?.pregnant || 'Pregnant'}
                                                    </span>
                                                )}
                                                {item.options.notes.tag1 && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-[11px] px-2 py-1 rounded font-bold">
                                                        {dict.tags?.allergy || 'Allergy'}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {/* Note Content */}
                                        {item.options.notes.content && (
                                            <div className="text-gray-600 italic text-xs bg-gray-50 p-2 rounded border border-gray-100">
                                                <span className="font-bold not-italic text-gray-400 mr-1">{dict.history?.note_label || 'Note'}:</span>
                                                {item.options.notes.content}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Custom Button */}
                                <button
                                    onClick={() => onCustomRequest(item)}
                                    className={`w-full py-3 rounded-xl border font-bold uppercase transition-all flex items-center justify-center gap-2 text-sm shadow-sm mt-4 ${hasCustom
                                        ? 'border-green-200 bg-white text-green-700 hover:bg-green-50'
                                        : 'border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-black'
                                        }`}
                                >
                                    {hasCustom ? <Check size={18} className="text-green-600" /> : <Wand2 size={16} />}
                                    <span>{dict.checkout.custom_for_you_btn}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Total Divider */}
                <div className="h-0 border-t-2 border-dashed border-gray-100 my-6"></div>

                {/* Total */}
                <div className="flex justify-between items-end">
                    <span className="text-black font-bold text-lg">Total</span>
                    <div className="text-right">
                        <span className={`block text-3xl font-black ${currency === 'USD' ? 'text-orange-600' : 'text-yellow-600'}`}>
                            {currency === 'USD'
                                ? `${total} USD`
                                : `${formatCurrency(total)} VND`
                            }
                        </span>
                        <div className="text-xs text-gray-400 italic mt-1">*Price includes VAT</div>
                    </div>
                </div>
            </div>
        </div >
    );
}
