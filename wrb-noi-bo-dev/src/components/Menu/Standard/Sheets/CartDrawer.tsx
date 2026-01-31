/*
 * File: Standard/Sheets/CartDrawer.tsx
 * Chức năng: Giỏ hàng tổng (Selected Services).
 * Logic chi tiết:
 * - Liệt kê toàn bộ các món đang có trong Cart.
 * - Tính tổng tiền (VND & USD) realtime.
 * - Nút +/- điều chỉnh số lượng trực tiếp mà KHÔNG đóng Drawer (giữ trải nghiệm liền mạch).
 * - Hỗ trợ hiển thị đa ngôn ngữ cho các nhãn (Title, Total, Button...).
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Service, CartState } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface CartDrawerProps {
    cart: CartState;
    services: Service[];
    lang: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdateCart: (id: string, quantity: number) => void;
}

// Translate Text
const TEXT = {
    title: { vn: 'Dịch vụ đã chọn', en: 'Services Selected', cn: '已选服务', jp: '選択されたサービス', kr: '선택된 서비스' },
    mins: { vn: 'phút', en: 'mins', cn: '分钟', jp: '分', kr: '분' },
    total: { vn: 'TỔNG CỘNG', en: 'TOTAL', cn: '总计', jp: '合計', kr: '합계' },
    close: { vn: 'ĐÓNG', en: 'CLOSE', cn: '关闭', jp: '閉じる', kr: '닫기' },
    continue: { vn: 'TIẾP TỤC', en: 'CONTINUE', cn: '继续', jp: '継続する', kr: '계속' }
};

export default function CartDrawer({ cart, services, lang, isOpen, onClose, onUpdateCart }: CartDrawerProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Animation Logic
    useEffect(() => {
        if (isOpen) {
            setIsVisible(false); // Reset trước
            setIsClosing(false);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    // Lọc ra các items có trong cart
    const cartItems = useMemo(() => {
        return Object.entries(cart)
            .map(([id, qty]) => {
                const service = services.find(s => s.id === id);
                return service ? { ...service, qty } : null;
            })
            .filter((item): item is Service & { qty: number } => item !== null && item.qty > 0);
    }, [cart, services]);

    // Tính tổng tiền
    const { totalVND, totalUSD } = useMemo(() => {
        return cartItems.reduce((acc, item) => ({
            totalVND: acc.totalVND + item.priceVND * item.qty,
            totalUSD: acc.totalUSD + item.priceUSD * item.qty
        }), { totalVND: 0, totalUSD: 0 });
    }, [cartItems]);

    const t = (key: keyof typeof TEXT) => TEXT[key][lang as keyof typeof TEXT['title']] || TEXT[key]['en'];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Drawer Container */}
            <div className={`
                fixed bottom-0 left-0 w-full bg-[#1e293b] rounded-t-[30px] z-50 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl
                transform transition-transform duration-300 ease-out pb-safe
                ${(isClosing || !isVisible) ? 'translate-y-full' : 'translate-y-0'}
            `}>

                {/* Header handle bar */}
                <div className="w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full opacity-50"></div>
                </div>

                {/* Title */}
                <div className="text-center pb-6 pt-2">
                    <h2 className="text-xl font-bold text-yellow-500 uppercase tracking-widest">{t('title')}</h2>
                    <div className="w-10 h-0.5 bg-yellow-600 mx-auto mt-2"></div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col gap-3">
                            {/* Top: Name & Qty Control */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">
                                        {item.names[lang as keyof typeof item.names] || item.names['en']}
                                    </h3>
                                    <div className="text-gray-400 text-sm italic mt-1 font-serif">
                                        {item.timeValue}{t('mins')}
                                        <span className="mx-1 text-gray-600">|</span>
                                        <span className="text-yellow-500 font-bold">{formatCurrency(item.priceVND)} VND</span>
                                        <span className="mx-1 text-gray-600">/</span>
                                        <span className="text-yellow-600 font-medium">{item.priceUSD} USD</span>
                                    </div>
                                </div>

                                {/* Quantity Control */}
                                <div className="flex items-center bg-[#0f172a] rounded-lg border border-gray-600 h-10">
                                    <button
                                        onClick={() => onUpdateCart(item.id, item.qty - 1)}
                                        className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-90"
                                    >
                                        <Minus size={16} />
                                    </button>

                                    <span className="w-8 text-center font-bold text-white text-lg">{item.qty}</span>

                                    <button
                                        onClick={() => onUpdateCart(item.id, item.qty + 1)}
                                        className="w-10 h-full flex items-center justify-center text-yellow-500 hover:text-yellow-400 transition-colors active:scale-90"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cartItems.length === 0 && (
                        <div className="text-center text-gray-500 py-10 italic">
                            Empty Cart
                        </div>
                    )}
                </div>

                {/* Footer Totals & Actions */}
                <div className="p-5 bg-[#0f172a] border-t border-gray-800">

                    {/* Total Row */}
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-gray-400 font-bold tracking-widest text-sm mb-1">{t('total')}</span>
                        <div className="text-right">
                            <div className="text-xl font-bold text-yellow-500">
                                {formatCurrency(totalVND)} VND <span className="text-sm font-normal text-gray-400">/</span> {totalUSD} USD
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-4 rounded-xl border border-gray-600 text-gray-300 font-bold uppercase hover:bg-gray-800 transition-colors"
                        >
                            {t('close')}
                        </button>
                        <button
                            className="flex-[2] py-4 rounded-xl bg-yellow-600 text-black font-bold uppercase shadow-lg shadow-yellow-600/20 hover:bg-yellow-500 transition-colors"
                        >
                            {t('continue')}
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}
