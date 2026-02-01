import React from 'react';
import { PencilLine, Wand2, Check } from 'lucide-react';
import { CartItem } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface InvoiceProps {
    cart: CartItem[];
    lang: string;
    onCustomRequest: (item: CartItem) => void;
}

export default function Invoice({ cart, lang, onCustomRequest }: InvoiceProps) {
    const totalVND = cart.reduce((sum, item) => sum + (item.priceVND * item.qty), 0);
    const totalUSD = cart.reduce((sum, item) => sum + (item.priceUSD * item.qty), 0);

    return (
        <div className="space-y-4">
            {/* Green Banner */}
            <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-center text-center">
                <span className="text-green-700 font-bold text-sm">*Please pay before entering the service room.</span>
            </div>

            <div className="bg-white text-black p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-gray-800 font-bold text-lg">Invoice Details</h2>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">#INV-001</span>
                </div>

                {/* List Items */}
                <div className="space-y-8 mb-8">
                    {cart.map(item => {
                        // 1. Determine effective values (Defaults if missing)
                        const strength = item.options?.strength || 'medium';
                        const therapist = item.options?.therapist || 'random';

                        // 2. Strict Check for "Customized" status (Green Check logic)
                        // Only true if values differ from defaults or extra info exists
                        const isStrengthCustom = strength !== 'medium';
                        const isTherapistCustom = therapist !== 'random';
                        const isBodyCustom = item.options?.bodyParts && (item.options.bodyParts.focus.length > 0 || item.options.bodyParts.avoid.length > 0);
                        const isNotesCustom = item.options?.notes && (item.options.notes.tag0 || item.options.notes.tag1 || item.options.notes.content);

                        const hasCustom = isStrengthCustom || isTherapistCustom || isBodyCustom || isNotesCustom;

                        // Helper to translate Parts logic
                        const formatParts = (parts: string[]) => parts.map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(', ');

                        return (
                            <div key={item.cartId} className="border-b border-dashed border-gray-200 pb-8 last:border-0 last:pb-0">
                                {/* Row 1: Name + Price */}
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-black font-bold text-lg">{item.names[lang] || item.names.en}</h4>
                                    <span className="text-yellow-600 font-bold text-lg">{formatCurrency(item.priceVND * item.qty)} VND</span>
                                </div>

                                {/* Row 2: Duration */}
                                <div className="text-gray-500 text-sm mb-3">
                                    {item.timeValue}mins
                                </div>

                                {/* Options Detail Box - Always Visible to show Defaults */}
                                <div className="bg-gray-50 rounded-lg p-4 text-sm mb-4 space-y-2 border border-gray-100">

                                    {/* Focus / Avoid (Conditional) */}
                                    {item.options?.bodyParts && (
                                        <>
                                            {item.options.bodyParts.focus.length > 0 && (
                                                <div className="flex gap-1">
                                                    <span className="font-bold text-green-600">Focus:</span>
                                                    <span className="text-green-700 font-medium">
                                                        {formatParts(item.options.bodyParts.focus)}
                                                    </span>
                                                </div>
                                            )}
                                            {item.options.bodyParts.avoid.length > 0 && (
                                                <div className="flex gap-1">
                                                    <span className="font-bold text-red-500">Avoid:</span>
                                                    <span className="text-red-400 font-medium">
                                                        {formatParts(item.options.bodyParts.avoid)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Strength / Therapist (Always Visible) */}
                                    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-gray-600 ${item.options?.bodyParts && (item.options.bodyParts.focus.length > 0 || item.options.bodyParts.avoid.length > 0) ? 'border-t border-gray-200 pt-2 mt-2' : ''}`}>
                                        <span>
                                            <span className="font-bold text-gray-800">Strength:</span>
                                            <span className={`ml-1 capitalize font-bold ${strength === 'light' ? 'text-green-700' :
                                                    strength === 'medium' ? 'text-yellow-700' :
                                                        strength === 'strong' ? 'text-red-700' : 'text-gray-600'
                                                }`}>{strength}</span>
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span>
                                            <span className="font-bold text-gray-800">Therapist:</span>
                                            <span className={`ml-1 capitalize font-bold ${therapist === 'male' ? 'text-blue-700' :
                                                    therapist === 'female' ? 'text-purple-700' :
                                                        therapist === 'random' ? 'text-green-700' : 'text-gray-600'
                                                }`}>{therapist}</span>
                                        </span>
                                    </div>

                                    {/* Tags (Conditional) */}
                                    {item.options?.notes && (item.options.notes.tag0 || item.options.notes.tag1) && (
                                        <div className="flex gap-2 pt-1 border-t border-gray-200 mt-2">
                                            {item.options.notes.tag0 && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">
                                                    Pregnant
                                                </span>
                                            )}
                                            {item.options.notes.tag1 && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">
                                                    Allergy
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>


                                {/* Custom Button - Matching Design */}
                                <button
                                    onClick={() => onCustomRequest(item)}
                                    className={`w-full py-3 rounded-xl border font-bold uppercase transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${hasCustom
                                        ? 'border-green-200 bg-white text-green-700 hover:bg-green-50'
                                        : 'border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-black'
                                        }`}
                                >
                                    {hasCustom ? <Check size={18} className="text-green-600" /> : <Wand2 size={16} />}
                                    <span>CUSTOM FOR YOU</span>
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
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalVND)} VND</div>
                        <div className="text-xs text-gray-400 italic mt-1">*Price includes VAT</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
