'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TipModalProps {
    onClose: (tipAmount: number) => void;
}

export default function TipModal({ onClose }: TipModalProps) {
    const tips = ["50.000vnd", "100.000vnd", "200.000vnd", "500.000vnd"];
    const [selectedTip, setSelectedTip] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
                {/* Close X */}
                <button onClick={() => onClose(0)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 border border-amber-100 shadow-inner">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-4">Xuất sắc!</h3>

                    <div className="bg-amber-100/50 text-amber-900 text-sm p-4 rounded-2xl mb-8 leading-relaxed border border-amber-100">
                        Cảm ơn vì sự hài lòng của bạn, bạn có thể gửi tiền tip cho nhân viên xem như phần thưởng khích lệ.
                    </div>

                    {/* Tip Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                        {tips.map((amount) => (
                            <button
                                key={amount}
                                disabled={isSubmitting}
                                onClick={() => setSelectedTip(amount)}
                                className={`py-4 px-2 rounded-2xl font-bold border-2 transition-all ${selectedTip === amount
                                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-md'
                                    : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300'
                                    } ${isSubmitting ? 'opacity-50 grayscale' : ''}`}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-4">
                        <button
                            onClick={async () => {
                                setIsSubmitting(true);
                                const amountNumber = parseInt(selectedTip?.replace(/\D/g, '') || '0');
                                await new Promise(r => setTimeout(r, 800)); // Visual feedback
                                onClose(amountNumber);
                            }}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${selectedTip
                                ? 'bg-gray-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-black'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedTip || isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" size={20} /> Đang xử lý...</>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                    Gửi tiền tip
                                </>
                            )}
                        </button>

                        <button 
                            disabled={isSubmitting}
                            onClick={() => onClose(0)} 
                            className="w-full py-2 text-gray-400 font-semibold text-sm hover:text-gray-600 disabled:opacity-0"
                        >
                            Bỏ qua
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
