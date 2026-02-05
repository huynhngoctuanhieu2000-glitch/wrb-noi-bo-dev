import React, { useState } from 'react';
import { CreditCard, Banknote, QrCode, DollarSign, Check, X, ArrowRightLeft } from 'lucide-react';
import { VND_DENOMINATIONS, USD_INFO, ACCEPTED_CARDS } from '@/lib/paymentConstants';
import { formatCurrency } from '@/components/Menu/utils';

interface PaymentMethodsProps {
    lang: string;
    dict: any;
    selected: string;
    onChange: (methodId: string) => void;
}

export default function PaymentMethods({ lang, dict, selected, onChange }: PaymentMethodsProps) {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [modalContent, setModalContent] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        onChange(id);
        setModalContent(id);
        setShowModal(true);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 200);
    };

    const METHODS = [
        {
            id: 'cash_vnd',
            icon: Banknote,
            label: dict.payment_methods.cash_vnd,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-500'
        },
        {
            id: 'cash_usd',
            icon: DollarSign,
            label: dict.payment_methods.cash_usd,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500'
        },
        {
            id: 'card',
            icon: CreditCard,
            label: dict.payment_methods.card,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-500'
        },
        {
            id: 'transfer',
            icon: QrCode,
            label: dict.payment_methods.transfer,
            color: 'text-gray-700',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-500'
        },
    ];

    return (
        <div className="bg-white p-1 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs p-4 pb-2">
                {dict.checkout.payment_method}
            </h2>

            {/* Horizontal Scroll Selector */}
            {/* Horizontal Scroll Selector */}
            <div className="flex overflow-x-auto gap-3 p-4 pt-2 pb-4 hide-scrollbar snap-x">
                {METHODS.map(method => {
                    const isSelected = selected === method.id;
                    return (
                        <button
                            key={method.id}
                            onClick={() => handleSelect(method.id)}
                            className={`flex-none w-[100px] snap-start flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all duration-200 ${isSelected
                                ? `${method.borderColor} ${method.bgColor} shadow-sm border`
                                : 'border-gray-100 bg-white hover:border-gray-200 border'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                                <method.icon size={24} className={isSelected ? method.color : 'text-gray-400'} strokeWidth={2.5} />  {/* icone size */}
                            </div>
                            <span className={`text-[11px] font-bold text-center leading-tight px-1 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                {method.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* INFO MODAL */}
            {showModal && (
                <div
                    className={`fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in duration-200'}`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl ${isClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95 duration-200'}`}
                    >

                        {/* Modal Header */}
                        <div className="p-6 pb-2 text-center relative">
                            <h3 className="text-xl font-bold text-gray-900">
                                {METHODS.find(m => m.id === modalContent)?.label}
                            </h3>
                            {modalContent === 'cash_vnd' && (
                                <p className="text-sm text-gray-500 mt-1">{dict.payment_methods.denominations}</p>
                            )}
                            {modalContent === 'cash_usd' && (
                                <p className="text-sm text-gray-500 mt-1">{dict.payment_methods.exchange_rules}</p>
                            )}
                            {modalContent === 'card' && (
                                <p className="text-sm text-gray-500 mt-1">{dict.payment_methods.cards_desc}</p>
                            )}
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto custom-scrollbar">

                            {/* VND Content */}
                            {modalContent === 'cash_vnd' && (
                                <div className="grid grid-cols-2 gap-3">
                                    {VND_DENOMINATIONS.map((denom) => (
                                        <div key={denom.amount} className="flex flex-col items-center gap-1">
                                            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[2/1] w-full relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={denom.imgUrl} alt={formatCurrency(denom.amount)} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{formatCurrency(denom.amount)} VND</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* USD Content */}
                            {modalContent === 'cash_usd' && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                                        <div className="text-sm text-yellow-800 font-bold uppercase mb-1">Exchange Rate</div>
                                        <div className="text-2xl font-black text-yellow-600">1 USD = {formatCurrency(USD_INFO.exchangeRate)} VND</div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <ArrowRightLeft size={16} className="text-blue-600" />
                                        </div>
                                        <p className="text-sm text-blue-800 font-medium leading-tight">
                                            {dict.payment_methods.refund_note}
                                        </p>
                                    </div>

                                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={USD_INFO.imgUrl} alt="USD" className="w-full h-auto object-cover" />
                                    </div>
                                </div>
                            )}

                            {/* Card Content */}
                            {modalContent === 'card' && (
                                <div>
                                    <p className="text-center text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{dict.payment_methods.accepted_cards}</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {ACCEPTED_CARDS.map((card) => (
                                            <div key={card.name} className="flex flex-col items-center gap-2">
                                                <div className="w-full aspect-[3/2] flex items-center justify-center p-2 rounded-xl border border-gray-100 shadow-sm bg-white">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={card.img} alt={card.name} className="w-auto h-auto max-w-full max-h-full object-contain" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 text-center">{card.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Transfer Content */}
                            {modalContent === 'transfer' && (
                                <div className="text-center py-8 text-gray-400">
                                    <QrCode size={64} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">Scan QR Code functionality coming soon.</p>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={closeModal}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-green-200"
                            >
                                {dict.payment_methods.understood}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
