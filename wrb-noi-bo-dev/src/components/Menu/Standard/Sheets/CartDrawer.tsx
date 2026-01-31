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
import { formatCurrency as formatMoney, formatCurrency } from '@/components/Menu/utils'; // Alias formatMoney to formatCurrency

interface CartDrawerProps {
    cart: CartState;
    services: Service[];
    lang: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdateCart: (id: string, quantity: number) => void;
    onCheckout: () => void; // New prop for checkout navigation
}

// Translate Text
const TEXT = {
    title: { vn: 'Dịch vụ đã chọn', en: 'Services Selected', cn: '已选服务', jp: '選択されたサービス', kr: '선택된 서비스' },
    mins: { vn: 'phút', en: 'mins', cn: '分钟', jp: '分', kr: '분' },
    total: { vn: 'TỔNG CỘNG', en: 'TOTAL', cn: '总计', jp: '合計', kr: '합계' },
    close: { vn: 'ĐÓNG', en: 'CLOSE', cn: '关闭', jp: '閉じる', kr: '닫기' },
    continue: { vn: 'TIẾP TỤC', en: 'CONTINUE', cn: '继续', jp: '継続する', kr: '계속' },
    empty: { vn: 'Giỏ hàng trống', en: 'Your cart is empty', cn: '购物车为空', jp: 'カートは空です', kr: '장바구니가 비어 있습니다' }
};

export default function CartDrawer({ cart, services, lang, isOpen, onClose, onUpdateCart, onCheckout }: CartDrawerProps) {
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

    // Tính tổng tiền trực tiếp từ cart (CartItem[])
    const { totalVND, totalUSD } = useMemo(() => {
        return cart.reduce((acc, item) => ({
            totalVND: acc.totalVND + (item.priceVND || 0) * item.qty,
            totalUSD: acc.totalUSD + (item.priceUSD || 0) * item.qty
        }), { totalVND: 0, totalUSD: 0 });
    }, [cart]);

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

                {/* 3. Danh sách món (Sử dụng map trên mảng CartItem) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 italic mt-10">
                            {t('empty')}
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.cartId} className="flex gap-4 bg-gray-900/50 p-3 rounded-xl border border-white/10">
                                {/* Ảnh */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                    <img src={item.img} alt={item.names[lang]} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h4 className="font-bold text-yellow-500 line-clamp-1">{item.names[lang]}</h4>
                                    <div className="text-xs text-gray-400 mb-2">
                                        {item.options ? (
                                            <span>Customized</span> // Tạm thời
                                        ) : (
                                            <span>{item.timeDisplay || `${item.timeValue} mins`}</span>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-white">
                                            {formatMoney(item.priceVND * item.qty)}
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => onUpdateCart(item.cartId, item.qty - 1)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-white w-4 text-center">{item.qty}</span>
                                            <button
                                                onClick={() => onUpdateCart(item.cartId, item.qty + 1)}
                                                className="w-6 h-6 flex items-center justify-center text-yellow-500 hover:text-yellow-400"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
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
                            onClick={onCheckout}
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
