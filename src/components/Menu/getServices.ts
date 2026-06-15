/*
 * File: Menu/getServices.ts
 * Chức năng: Client-side fetching.
 * Logic: Gọi API internal (/api/services) với cơ chế Timeout & Auto-Retry để chống Cold Start trên Vercel.
 */
import { Service } from '../../components/Menu/types';

const FETCH_TIMEOUT_MS = 8000; // Timeout 8 giây cho mỗi lần thử
const MAX_RETRIES = 3;

// Hàm chính lấy dữ liệu (qua API)
export const getServices = async (filterType?: 'standard' | 'vip' | 'all', attempt = 1): Promise<Service[]> => {
    try {
        // Áp dụng AbortController để timeout request nếu quá lâu
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch('/api/services', {
            cache: 'no-store', // Luôn lấy mới
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`API returned status ${res.status}`);
        }

        const allServices: Service[] = await res.json();

        // Filtering Client-side (nhẹ nhàng vì số lượng service ít)
        if (filterType && filterType !== 'all') {
            return allServices.filter(s => s.menuType === filterType);
        }

        return allServices;

    } catch (error) {
        console.warn(`⚠️ [Menu API] Lỗi lấy dữ liệu (Lần ${attempt}/${MAX_RETRIES}):`, error);
        
        // Cơ chế Auto-Retry
        if (attempt < MAX_RETRIES) {
            const delayMs = attempt * 1500; // Tăng dần thời gian chờ: 1.5s, 3s
            console.log(`🔄 Thử lại sau ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return getServices(filterType, attempt + 1);
        }

        console.error("❌ [Menu API] Đã thử tối đa số lần nhưng vẫn thất bại.");
        throw error; // Quăng lỗi ra ngoài để MenuContext bắt được và hiển thị UI
    }
};
