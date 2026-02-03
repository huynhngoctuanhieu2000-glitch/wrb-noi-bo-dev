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
import { useMenuData } from '@/components/Menu/MenuContext';
import { Service, CartState, CartItem } from '@/components/Menu/types';
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
    empty: { vn: 'Giỏ hàng trống', en: 'Your cart is empty', cn: '购物车为空', jp: 'カートは空です', kr: '장바구니가 비어 있습니다' },
    alert_empty: { vn: 'Vui lòng chọn ít nhất 1 dịch vụ!', en: 'Please select at least 1 service!', cn: '请至少选择一项服务！', jp: '少なくとも1つのサービスを選択してください！', kr: '최소 1개의 서비스를 선택해주세요!' }
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

    // Group items logic
    const groupedCart = useMemo(() => {
        const groups: { [key: string]: CartItem & { totalQty: number } } = {};

        cart.forEach(item => {
            if (!groups[item.id]) {
                groups[item.id] = { ...item, totalQty: 0 };
            }
            groups[item.id].totalQty += item.qty;
        });

        return Object.values(groups);
    }, [cart]);

    const handleIncrease = (item: CartItem) => {
        // Add a new item with same details to context
        // We use onUpdateCart to add quantity? No, context addToCart is better but props only give onUpdateCart.
        // Looking at MenuContext: addToCart adds new item. updateCartItem updates specific cartId.
        // Since we want to support splitting later, adding a new item (row) is better than increasing qty of existing row if the existing row logic is 1 row = 1 person.
        // However, the current Context addToCart implementation ADDS a new row.
        // But here we are passed `onUpdateCart`. Let's check parent usage.
        // If parent is StandardMenu, it passes `updateCartItem`.

        // Wait, if we use `updateCartItem(cartId, qty + 1)`, it updates that specific row.
        // If we want to "add another one", we essentially need `addToCart`.
        // But `CartDrawer` props only have `onUpdateCart`.

        // Let's look at how `MenuContext` handles `addToCart`.
        // It creates a new unique `cartId`.

        // In this Drawer, if I press (+), logically I want another instance of this service.
        // Since `onUpdateCart` takes a `cartId`, I can only update an existing row.
        // If I update an existing row's qty to 2, it is still 1 row.
        // When checking out, does it split?
        // Checkout page: `cart.map...` -> If one row has qty 2, it shows as one row.
        // The user requirement is: "Group in Cart, Split in Checkout".
        // This means in Context state, we should have multiple rows (Qty 1 each) or One row (Qty N).

        // If we want split in Checkout, best to have multiple rows in Context.
        // So (+) click should call `addToCart`.
        // But `CartDrawer` prop `onUpdateCart` is limited.

        // Let's look at `CartDrawerProps`: it has `onUpdateCart`.
        // We should probably add `onAddToCart` prop or use context directly?
        // `CartDrawer` is a component, might be better to use `useMenuData` directly if allowed or pass `addToCart`.
        // The file imports `useMenuData` inside `MenuContext`, but `CartDrawer` is a dumb component receiving props.
        // Actually `CartDrawer` is imported in `MainSheet`.

        // Let's assume for now we use the `onUpdateCart` to just increase quantity of the FIRST item found in that group.
        // AND we rely on the fact that `MenuContext` logic might need adjustment if we strictly want distinct rows.
        // BUT, the plan said: "Visual grouping".
        // So:
        // - Display: Sum of Qty.
        // - Action (+): Add NEW item (need `addToCart`) OR increase Qty of one existing item.
        // If we increase Qty of existing item, then Checkout page receives [Item A (Qty 2)].
        // Does Checkout page split it? Request says: "khi chuyển qua trang check out mới tách lẻ".
        // So if Context has [Item A (Qty 2)], Checkout needs to split it into [Item A (Qty 1), Item A (Qty 1)].
        // OR Context should separate them from the start [Item A (Qty 1), Item A (Qty 1)].

        // OPTION 1: Context keeps distinct rows. CartDrawer groups them visually.
        // Click (+): We need to call `addToCart` to add a new distinct row.
        // Click (-): We find *any* row with that ServiceID and remove it (or decrease qty).

        // Currently `CartDrawer` does NOT receive `addToCart`.
        // I should probably use `useMenuData` inside `CartDrawer` (since it is 'use client') or pass it down.
        // `CartDrawer` *is* used in `Standard/Sheets/index.js` (or similar).
        // Let's check imports. `CartDrawer` imports `Service`, `CartState`.

        // Let's modify `CartDrawer` to use `useMenuData` directly for actions? 
        // Or simple: Just display grouped.
        // If I update `cart[0].qty` to 2. Visual shows 2.
        // Checkout shows 1 row with Qty 2. 
        // User says: "Checkout mới tách lẻ". 
        // So Checkout Page needs to handle the splitting? 
        // "khi chuyển qua trang check out mới tách lẻ để custom theo ý khách nhé"
        // THIS IMPLIES: Checkout page logic should split items.

        // So, for now in CartDrawer, I just need to group VISUALLY.
        // If I increment Qty, I can just increment the Qty of the/one item?
        // NO, if I increment, I want to allow splitting later.

        // Best approach:
        // Use `useMenuData` hook inside CartDrawer to get `addToCart` and `removeFromCart`.
        // Ignore the passed `onUpdateCart` for `+` action if we want new rows.
        // Wait, `MenuContext` `addToCart` implementation:
        // `const newItem = { ...service, cartId: unique, qty: qty ... }` -> Adds new row.

        // Let's use `useMenuData` inside `CartDrawer` to interact with context.
        // Remove `cart` prop? No, keep props for now, just add hook.
    };

    // Refactor: Use hook to get actions
    // But wait, `CartDrawer` takes specific props from parent.
    // Let's stick to using the `cart` prop for data.
    // For actions: `addToCart` is needed.
    // I can import `useMenuData` here? Yes, it is exported.

    // Changing standard component pattern...
    // Let's try to match existing pattern.
    // Existing `onUpdateCart` is `(id: string, quantity: number) => void`.
    // It updates a specific `cartId`.

    // If I group items { id: 'NHS1', items: [row1, row2], totalQty: 2 }
    // (+) Click: I want to add another 'NHS1'.
    // Use `addToCart(service, 1)`.
    // (-) Click: I want to remove 'row1' (or decrease its qty).

    // So I need access to `addToCart`.
    // I will add `const { addToCart, removeFromCart } = useMenuData();`

    // Visual changes:
    // - Loop `groupedCart`
    // - Red USD
    // - Remove 'Customized'

    const { addToCart, removeFromCart } = useMenuData();

    const handlePlus = (item: Service) => {
        addToCart(item, 1);
    };

    const handleMinus = (itemId: string) => {
        // Find the last instance of this item in the cart to remove
        // We want to remove one instance (LIFO or FIFO doesn't matter much here, maybe LIFO to keep recent customizations?)
        // Let's find one instance with this Service ID.
        const instance = cart.find(c => c.id === itemId);
        if (instance) {
            removeFromCart(instance.cartId);
        }
    };

    // Restore missing logic
    const { totalVND, totalUSD } = useMemo(() => {
        return cart.reduce((acc, item) => ({
            totalVND: acc.totalVND + (item.priceVND || 0) * item.qty,
            totalUSD: acc.totalUSD + (item.priceUSD || 0) * item.qty
        }), { totalVND: 0, totalUSD: 0 });
    }, [cart]);

    const t = (key: keyof typeof TEXT) => TEXT[key][lang as keyof typeof TEXT['title']] || TEXT[key]['en'];

    const handleContinue = () => {
        if (cart.length === 0) {
            alert(t('alert_empty'));
            return;
        }
        onCheckout();
    };

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

                {/* 3. Danh sách món (Grouped) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {groupedCart.length === 0 ? (
                        <div className="text-center text-gray-500 italic mt-10">
                            {t('empty')}
                        </div>
                    ) : (
                        groupedCart.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-gray-900/50 p-3 rounded-xl border border-white/10">
                                {/* Ảnh */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                    <img src={item.img} alt={item.names[lang]} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h4 className="font-bold text-yellow-500 line-clamp-1">{item.names[lang]}</h4>
                                    <div className="text-xs text-gray-400 mb-2">
                                        <span>{item.timeDisplay || `${item.timeValue} mins`}</span>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-white">
                                            {formatMoney(item.priceVND * item.totalQty)}
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => handleMinus(item.id)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-white w-4 text-center">{item.totalQty}</span>
                                            <button
                                                onClick={() => handlePlus(item)}
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
                                {formatCurrency(totalVND)} VND <span className="text-sm font-normal text-gray-400">/</span> <span className="text-red-500">{totalUSD} USD</span>
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
                            onClick={handleContinue}
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
