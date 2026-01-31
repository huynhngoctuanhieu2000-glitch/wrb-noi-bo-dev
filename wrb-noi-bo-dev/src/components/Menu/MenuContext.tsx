/*
 * File: Menu/MenuContext.tsx
 * Chức năng: Context API cung cấp dữ liệu dịch vụ toàn cục
 * Logic:
 * - Fetch toàn bộ services ngay khi Provider mount (tại layout).
 * - Cung cấp danh sách services, loading state và error cho toàn app.
 * - Giúp các trang con (như StandardMenu) có data ngay lập tức mà không cần fetch lại.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Service, ServiceOptions, CartItem, Category } from '@/components/Menu/types';
import { getServices } from '@/components/Menu/getServices';

interface MenuContextType {
    services: Service[];
    categories: Category[]; // Added categories
    loading: boolean;
    error: any;
    refreshData: () => Promise<void>;

    // --- Cart Logic ---
    cart: CartItem[];
    addToCart: (service: Service, qty: number, options?: ServiceOptions) => void;
    updateCartItem: (cartId: string, qty: number) => void;
    updateAllCartItemOptions: (options: ServiceOptions) => void;
    removeFromCart: (cartId: string) => void;
    clearCart: () => void;
    getQty: (serviceId: string) => number; // Helper lấy tổng số lượng của 1 service ID
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // Add categories state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getServices('all');
            console.log('🚀 [MenuData] Pre-fetched', data.length, 'services');
            setServices(data);
        } catch (err) {
            console.error('❌ [MenuData] Error fetching:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- CART FUNCTIONS ---

    // 1. Thêm món (Tạo cartId mới hoặc cộng dồn nếu option giống hệt - tạm thời cứ tạo mới để dễ custom)
    const addToCart = (service: Service, qty: number, options?: ServiceOptions) => {
        setCart(prev => {
            // Logic: Nếu cùng ID và chưa có options thì cộng dồn? 
            // Hiện tại để đơn giản cho tính năng Custom: Mỗi lần Add là 1 dòng mới nếu muốn
            // Nhưng với luồng Menu hiện tại (MainSheet), user chọn số lượng.
            // Tạm thời: Cộng dồn nếu chưa có CartId (logic cũ) -> Sẽ điều chỉnh khi ráp Custom Modal.
            // Để tương thích code cũ: Tìm xem có item nào cùng serviceId không.

            // Cách đơn giản nhất để tương thích MainSheet:
            // MainSheet đang truyền (id, qty).
            // Ta cần map id -> service object.

            const newItem: CartItem = {
                ...service,
                cartId: `${service.id}-${Date.now()}-${Math.random()}`,
                qty,
                options: options || {}
            };
            return [...prev, newItem];
        });
    };

    // Cập nhật số lượng
    const updateCartItem = (cartId: string, qty: number) => {
        setCart(prev => {
            if (qty <= 0) {
                return prev.filter(item => item.cartId !== cartId);
            }
            return prev.map(item => item.cartId === cartId ? { ...item, qty } : item);
        });
    };

    // [NEW] Cập nhật options cho TOÀN BỘ giỏ hàng (Bulk Update)
    const updateAllCartItemOptions = (options: ServiceOptions) => {
        setCart(prev => prev.map(item => ({ ...item, options: { ...item.options, ...options } })));
    };

    // 3. Xóa
    const removeFromCart = (cartId: string) => updateCartItem(cartId, 0);

    // 4. Xóa hết
    const clearCart = () => setCart([]);

    // 5. Helper lấy số lượng (để hiện badge trên Menu)
    const getQty = (serviceId: string) => {
        return cart.filter(item => item.id === serviceId).reduce((sum, item) => sum + item.qty, 0);
    };

    return (
        <MenuContext.Provider value={{
            services, categories, loading, error, refreshData: fetchData,
            cart, addToCart, updateCartItem, updateAllCartItemOptions, removeFromCart, clearCart, getQty
        }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenuData = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenuData must be used within a MenuProvider');
    }
    return context;
};
