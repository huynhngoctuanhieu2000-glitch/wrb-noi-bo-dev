import React from 'react';
import { PencilLine, Wand2 } from 'lucide-react';
import { CartItem } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface InvoiceProps {
    cart: CartItem[];
    lang: string;
    onCustomRequest: () => void;
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
                    {cart.map(item => (
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

                            {/* Row 3: Options (Strength, Therapist) */}
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4 flex gap-4">
                                <span><span className="font-bold text-gray-800">Strength:</span> {item.options?.strength || 'Medium'}</span>
                                <span className="text-gray-300">|</span>
                                <span><span className="font-bold text-gray-800">Therapist:</span> {item.options?.therapist || 'Random'}</span>
                            </div>

                            {/* Custom Button */}
                            <button
                                onClick={onCustomRequest}
                                className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-bold uppercase hover:bg-gray-50 hover:text-black transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Wand2 size={16} />
                                <span>CUSTOM FOR YOU</span>
                            </button>
                        </div>
                    ))}
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
