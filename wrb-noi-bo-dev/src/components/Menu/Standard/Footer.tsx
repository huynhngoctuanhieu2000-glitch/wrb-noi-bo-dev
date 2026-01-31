'use client';
import React from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/components/Menu/utils';

interface FooterProps {
    totalVND: number;
    totalUSD: number;
    totalItems: number;
    maxMinutes: number;
    lang: string;
    onBack: () => void;
    onToggleCart: () => void;
}

export default function Footer({ totalVND, totalUSD, totalItems, maxMinutes, lang, onBack, onToggleCart }: FooterProps) {
    return (
        <div
            className="glass-footer w-full p-4 flex items-center justify-between gap-3 animate-[slide-up_0.3s_ease-out] bg-black/90 backdrop-blur-xl border-t border-gray-800 pb-safe"
            // THÊM ĐOẠN STYLE NÀY: Ép buộc trình duyệt gim xuống đáy
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10 // Đảm bảo nổi lên trên tất cả
            }}
        >

            {/* Nút Back */}
            <button onClick={onBack} className="relative w-14 h-14 shrink-0 rounded-full border-2 border-green-500 bg-black flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95 transition-transform group">
                <img src={`https://flagcdn.com/w80/${lang === 'vn' ? 'vn' : 'gb'}.png`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" alt="Lang" />
                <span className="absolute bottom-0 left-0 w-full text-[8px] font-bold text-center bg-black/60 text-green-400 backdrop-blur-[1px] py-[1px]">BACK</span>
            </button>

            {/* Thông tin Tiền & Thời gian */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                {maxMinutes > 0 && (
                    <div className="text-[9px] text-gray-400 font-bold tracking-[0.15em] uppercase mb-0.5 flex items-center gap-1 whitespace-nowrap">
                        Total Estimated <span className="text-yellow-500 font-bold ml-1">• {maxMinutes} {lang === 'vn' ? 'phút' : 'mins'}</span>
                    </div>
                )}
                <div className="flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span className="font-serif text-xl text-white tracking-wide">{formatCurrency(totalVND)}</span>
                    <span className="text-[9px] text-gray-500 font-bold mr-2">VND</span>
                    <span className="text-gray-700 text-xs font-light">/</span>
                    <span className="font-serif text-lg text-yellow-500 tracking-wide ml-2">{totalUSD}</span>
                    <span className="text-[9px] text-yellow-600 font-bold">USD</span>
                </div>
            </div>

            {/* Nút Giỏ hàng */}
            <button onClick={onToggleCart} className="h-12 shrink-0 bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold px-6 rounded-xl shadow-lg active:scale-95 transition-all text-sm tracking-wide uppercase flex items-center gap-2 relative overflow-visible">
                <ShoppingCart className="w-5 h-5" />
                <span className={`absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black transition-all transform duration-300 ${totalItems > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>{totalItems}</span>
            </button>
        </div>
    );
}