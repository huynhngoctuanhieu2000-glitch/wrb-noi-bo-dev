import { supabase } from '@/lib/supabase';
import { Service } from '@/components/Menu/types';

/**
 * Lấy danh sách dịch vụ từ Supabase (Server-side & Client-side)
 * Logic này đã được chuyển đổi từ Firebase sang PostgreSQL
 */
export const getMenuData = async (): Promise<Service[]> => {
    try {
        // Lấy dữ liệu services kèm theo thông tin của categories (JOIN)
        const { data, error } = await supabase
            .from('services')
            .select(`
                *,
                categories (
                    name_vn
                )
            `)
            .order('id', { ascending: true });

        if (error) {
            console.error("❌ [Supabase] Lỗi lấy dữ liệu:", error.message);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn("⚠️ [Supabase] Không tìm thấy dữ liệu trong bảng 'services'");
            return [];
        }

        const services: Service[] = data.map((item: any) => {
            // Helper để xác định menuType
            const getMenuTypeFromId = (id: string): 'standard' | 'vip' | 'unknown' => {
                if (id.startsWith('NHS')) return 'standard';
                if (id.startsWith('NHP')) return 'vip';
                return 'unknown';
            };

            return {
                id: item.id,
                cat: item.categories?.name_vn || "Unknown",
                names: {
                    en: item.names?.en || "",
                    vn: item.names?.vn || "",
                    cn: item.names?.cn,
                    jp: item.names?.jp,
                    kr: item.names?.kr,
                },
                descriptions: {
                    en: item.descriptions?.en || "",
                    vn: item.descriptions?.vn || "",
                    cn: item.descriptions?.cn,
                    jp: item.descriptions?.jp,
                    kr: item.descriptions?.kr,
                },
                img: item.image_url || "https://placehold.co/300x200?text=No+Image",
                priceVND: Number(item.price_vn) || 0,
                priceUSD: Number(item.price_usd) || 0,
                timeValue: Number(item.time_mins) || 0,
                timeDisplay: `${item.time_mins} mins`,
                menuType: getMenuTypeFromId(item.id) as 'standard' | 'vip',
                TAGS: item.tags || [],
                FOCUS_POSITION: item.focus_position,
                SHOW_STRENGTH: true,
                HINT: item.HINT, // Để lại nếu có map sau này
                ACTIVE: item.active,
                BEST_SELLER: item.is_best_seller,
                BEST_CHOICE: item.is_best_choice
            };
        });

        return services;

    } catch (error) {
        console.error("❌ [Supabase] Lỗi không xác định:", error);
        return [];
    }
};
