import { collection, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Service, MultiLangString } from '@/components/Menu/types';

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

const getMenuTypeFromId = (id: string): 'standard' | 'vip' | 'unknown' => {
    if (id.startsWith('NHS')) return 'standard';
    if (id.startsWith('NHP')) return 'vip';
    return 'unknown';
};

/**
 * Lấy danh sách dịch vụ từ Firebase (Server-side)
 * Logic này chạy trên Server (Node.js runtime)
 */
export const getMenuData = async (): Promise<Service[]> => {
    try {
        if (!db) {
            console.error("🔥 [Server] Firebase DB chưa được khởi tạo!");
            return [];
        }

        const servicesRef = collection(db, "Services");
        const snapshot = await getDocs(servicesRef);

        if (snapshot.empty) {
            console.warn("⚠️ [Server] Không tìm thấy dữ liệu trong collection 'Services'");
            return [];
        }

        const services: Service[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as FirebaseServiceData;

            if (!data.ID || !data.NAMES) return;

            const currentItemType = getMenuTypeFromId(data.ID);

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
                menuType: currentItemType as 'standard' | 'vip',
                tags: data.TAGS || []
            });
        });

        return services;

    } catch (error) {
        console.error("❌ [Server] Lỗi lấy dữ liệu Firebase:", error);
        return [];
    }
};
