// 1. Import các hàm từ Modular SDK của Firestore
/*
 * File: Menu/getServices.ts
 * Chức năng: Layer xử lý lấy dữ liệu dịch vụ (Data Fetching).
 * Logic chi tiết:
 * - Hàm getServices(type): Trả về danh sách dịch vụ dựa trên loại menu (Standard/VIP).
 * - Hiện tại: Trả về dữ liệu mock từ constants.ts.
 * - Tương lai: Có thể mở rộng để gọi API hoặc truy vấn Firebase từ đây.
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { Service, MultiLangString } from '../../components/Menu/types';

// Định nghĩa kiểu dữ liệu THÔ trên Firebase
interface FirebaseServiceData {
    ID: string;
    CATEGORY: string;
    NAMES: MultiLangString;
    DESCRIPTIONS: MultiLangString;
    IMAGE_URL: string;
    PRICE_VN: number;
    PRICE_USD: number;
    TIME: number;
    TAGS?: any[];
    HINT?: any;
    FOCUS_POSITION?: any;
}

// Hàm hỗ trợ xác định loại Menu
const getMenuTypeFromId = (id: string): 'standard' | 'vip' | 'unknown' => {
    if (id.startsWith('NHS')) return 'standard';
    if (id.startsWith('NHP')) return 'vip';
    return 'unknown';
};

// Hàm chính lấy dữ liệu
export const getServices = async (filterType: 'standard' | 'vip'): Promise<Service[]> => {
    try {
        // Kiểm tra db có tồn tại không
        if (!db) {
            console.error("🔥 Lỗi: Firebase DB chưa được khởi tạo!");
            return [];
        }

        // --- SỬA LỖI Ở ĐÂY: Dùng cú pháp Modular SDK ---
        // Thay vì db.collection('Services').get()
        // Ta dùng: getDocs(collection(db, 'Services'))

        const servicesRef = collection(db, "Services");
        const snapshot = await getDocs(servicesRef);

        if (snapshot.empty) {
            console.warn("⚠️ Không tìm thấy dữ liệu trong collection 'Services'");
            return [];
        }

        const services: Service[] = [];

        // Lúc này biến 'doc' sẽ tự động hiểu kiểu dữ liệu, không bị lỗi 'any' nữa
        snapshot.forEach((doc) => {
            const data = doc.data() as FirebaseServiceData;

            // Validate dữ liệu
            if (!data.ID || !data.NAMES) return;

            // Filter loại menu
            const currentItemType = getMenuTypeFromId(data.ID);
            if (currentItemType !== filterType) return;

            // Mapping dữ liệu
            services.push({
                id: data.ID,
                cat: data.CATEGORY,

                names: {
                    en: data.NAMES.EN || data.NAMES.en || "",
                    vn: data.NAMES.VN || data.NAMES.vn || "",
                    cn: data.NAMES.CN || data.NAMES.cn,
                    jp: data.NAMES.JP || data.NAMES.jp,
                    kr: data.NAMES.KR || data.NAMES.kr,
                },

                descriptions: {
                    en: data.DESCRIPTIONS?.EN || data.DESCRIPTIONS?.en || "",
                    vn: data.DESCRIPTIONS?.VN || data.DESCRIPTIONS?.vn || "",
                    cn: data.DESCRIPTIONS?.CN || data.DESCRIPTIONS?.cn,
                    jp: data.DESCRIPTIONS?.JP || data.DESCRIPTIONS?.jp,
                    kr: data.DESCRIPTIONS?.KR || data.DESCRIPTIONS?.kr,
                },

                img: data.IMAGE_URL || "https://placehold.co/300x200?text=No+Image",

                priceVND: Number(data.PRICE_VN) || 0,
                priceUSD: Number(data.PRICE_USD) || 0,

                timeValue: Number(data.TIME) || 0,
                timeDisplay: `${data.TIME} mins`,

                menuType: currentItemType,
                tags: data.TAGS || []
            });
        });

        return services;

    } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu Firebase:", error);
        return [];
    }
};