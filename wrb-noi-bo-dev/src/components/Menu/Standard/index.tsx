/*
 * File: Standard/index.tsx
 * Chức năng: Component gốc (Root) của Menu Standard.
 * Logic chi tiết:
 * - Quản lý state toàn cục: cart (giỏ hàng), sheet (trạng thái hiển thị popup), activeCategory.
 * - Fetch dữ liệu service từ getServices.
 * - Tính toán tổng tiền (VND/USD) và tổng item thông qua useMemo.
 * - Điều phối hiển thị các Sheet: MainSheet (chọn giờ), ReviewSheet (sửa món), CartDrawer (giỏ hàng).
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';

// 1. Import Components con
import Header from './Header';
import ServiceList from './ServiceList';
import Footer from './Footer';

// Import các Sheet
import MainSheet from './Sheets/MainSheet';
import ReviewSheet from './Sheets/ReviewSheet';
import CartDrawer from './Sheets/CartDrawer'; // Import CartDrawer

// 2. Import Logic & Data
import { CATEGORIES } from '@/components/Menu/constants';
import { Service, CartState, SheetState } from '@/components/Menu/types';
import { getServices } from '@/components/Menu/getServices'; // Đảm bảo đường dẫn đúng

interface StandardMenuProps {
    lang: string;
    onBack: () => void;
}

export default function StandardMenu({ lang, onBack }: StandardMenuProps) {
    // --- STATE DỮ LIỆU ---
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartState>({});

    // --- STATE GIAO DIỆN ---
    const [activeCategory, setActiveCategory] = useState<string>('Body');

    // State quản lý Sheet
    const [sheet, setSheet] = useState<SheetState>({
        isOpen: false,
        type: null,
        data: null
    });

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getServices('standard');
            console.log('🔥 [FIREBASE - Standard Menu] Tải thành công! Tổng dịch vụ:', data.length);
            setServices(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    // --- 2. LOGIC TÍNH TOÁN CART ---
    const { totalVND, totalUSD, totalItems, maxMinutes } = useMemo(() => {
        let vnd = 0, usd = 0, items = 0, maxMin = 0;
        Object.entries(cart).forEach(([id, qty]) => {
            const svc = services.find(s => s.id === id);
            if (svc) {
                vnd += svc.priceVND * qty;
                usd += svc.priceUSD * qty;
                items += qty;
                if (svc.timeValue > maxMin) maxMin = svc.timeValue;
            }
        });
        return { totalVND: vnd, totalUSD: usd, totalItems: items, maxMinutes: maxMin };
    }, [cart, services]);

    // --- 3. XỬ LÝ TƯƠNG TÁC ---

    // [QUAN TRỌNG] Khi bấm vào Card ở List -> Nhận vào 1 NHÓM (Service[])
    const handleServiceClick = (group: Service[]) => {
        // Luôn mở MainSheet để khách chọn thời gian (theo yêu cầu mới)
        setSheet({ isOpen: true, type: 'MAIN', data: group });
    };

    // Hàm cập nhật Cart (Dùng cho cả MainSheet và ReviewSheet)
    const updateCart = (id: string, qty: number) => {
        setCart((prev: CartState) => {
            // Nếu qty = 0 thì xóa key đó đi cho nhẹ object (tùy chọn), hoặc cứ để 0
            if (qty === 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: qty };
        });

        // Cập nhật xong thì đóng Sheet
        // (Lưu ý: Nếu muốn giữ Sheet mở để chỉnh tiếp thì bỏ dòng này)
        // closeSheet(); // Đã comment để không tự đóng (Fix cho CartDrawer)
    };

    // Hàm Add đặc biệt cho MainSheet (Cộng dồn số lượng)
    const addToCart = (id: string, qty: number) => {
        setCart((prev: CartState) => ({
            ...prev,
            [id]: (prev[id] || 0) + qty
        }));
        closeSheet();
    };

    // Mở giỏ hàng tổng (Sẽ làm CartDrawer sau)
    const handleOpenCart = () => {
        setSheet({ isOpen: true, type: 'CART', data: null });
    };

    // Đóng Sheet
    const closeSheet = () => {
        setSheet({ ...sheet, isOpen: false });
        setTimeout(() => setSheet({ isOpen: false, type: null, data: null }), 300);
    };

    // --- 4. RENDER UI ---
    if (loading) return <div className="h-screen bg-black text-yellow-500 flex items-center justify-center">Loading...</div>;

    return (
        <div className="relative inset-0 z-20 bg-black flex flex-col h-[100dvh] w-full overflow-hidden font-sans">

            {/* A. HEADER */}
            <Header
                categories={CATEGORIES}
                activeCategory={activeCategory}
                lang={lang}
                onSelectCategory={(id) => {
                    setActiveCategory(id);
                    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
            />

            {/* B. LIST */}
            <ServiceList
                categories={CATEGORIES}
                services={services}
                cart={cart}
                lang={lang}
                onItemClick={handleServiceClick} // Truyền hàm xử lý nhóm
            />

            {/* C. FOOTER */}
            <Footer
                totalVND={totalVND}
                totalUSD={totalUSD}
                totalItems={totalItems}
                maxMinutes={maxMinutes}
                lang={lang}
                onBack={onBack}
                onToggleCart={handleOpenCart}
            />

            {/* D. KHU VỰC CÁC SHEET */}

            {/* 1. Main Sheet (Chọn thời gian) - Nhận data là Array (Group) */}
            {sheet.isOpen && sheet.type === 'MAIN' && Array.isArray(sheet.data) && (
                <MainSheet
                    group={sheet.data} // Truyền data (là mảng) vào prop group
                    cart={cart} // Truyền cart để check item đã mua
                    isOpen={sheet.isOpen}
                    lang={lang}
                    onClose={closeSheet}
                    onAddToCart={addToCart}
                />
            )}

            {/* 2. Review Sheet (Xem lại món đơn lẻ) - Nhận data là 1 Service */}
            {sheet.isOpen && sheet.type === 'REVIEW' && !Array.isArray(sheet.data) && sheet.data && (
                <ReviewSheet
                    service={sheet.data}
                    cart={cart}
                    isOpen={sheet.isOpen}
                    lang={lang}
                    onClose={closeSheet}
                    onUpdateCart={updateCart}
                />
            )}

            {/* 3. Cart Drawer (Giỏ hàng) */}
            {sheet.isOpen && sheet.type === 'CART' && (
                <CartDrawer
                    cart={cart}
                    services={services}
                    lang={lang}
                    isOpen={sheet.isOpen}
                    onClose={closeSheet}
                    onUpdateCart={updateCart}
                />
            )}

        </div>
    );
}