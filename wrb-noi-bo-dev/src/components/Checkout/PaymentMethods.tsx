import React from 'react';
import { CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';

interface PaymentMethodsProps {
    lang: string;
    selected: string;
    onChange: (methodId: string) => void;
}

const METHODS = [
    { id: 'cash_vnd', icon: Banknote, label: 'Cash VND' },
    { id: 'cash_usd', icon: Banknote, label: 'Cash USD' }, // Use dollar sign icon logic in render if needed or generic Banknote
    { id: 'card', icon: CreditCard, label: 'Card' },
    { id: 'transfer', icon: ArrowRightLeft, label: 'Transfer' },
];

export default function PaymentMethods({ lang, selected, onChange }: PaymentMethodsProps) {
    return (
        <div className="bg-white p-1 rounded-3xl border border-green-200 overflow-hidden">
            <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs p-4 pb-2">
                PAYMENT METHOD
            </h2>

            <div className="grid grid-cols-4 gap-2 p-2 pt-0">
                {METHODS.map(method => (
                    <button
                        key={method.id}
                        onClick={() => onChange(method.id)}
                        className={`flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border transition-all ${selected === method.id
                                ? 'bg-white border-2 border-green-500 shadow-lg shadow-green-100 z-10'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                            }`}
                    >
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === method.id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {method.id === 'cash_usd' ? (
                                <span className="font-bold text-lg">$</span>
                            ) : (
                                <method.icon size={20} />
                            )}
                        </div>

                        {/* Label */}
                        <div className={`text-xs font-bold text-center leading-tight ${selected === method.id ? 'text-black' : 'text-gray-400'
                            }`}>
                            {method.label.split(' ').map((word, i) => (
                                <div key={i}>{word}</div>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
