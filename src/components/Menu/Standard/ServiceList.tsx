'use client';
/*
 * File: Standard/ServiceList.tsx
 * Chức năng: Render danh sách nhóm dịch vụ theo Category.
 * Logic chi tiết:
 * - Nhận danh sách services và categories.
 * - Group services theo Category ID (Body, Foot...).
 * - Render từng section (Tiêu đề Category + Grid các ServiceItem).
 * - Sử dụng useMemo để tối ưu hóa việc nhóm dữ liệu.
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import ServiceItem from '@/components/Menu/Standard/ServiceItem';
import { Category, Service, CartState } from '@/components/Menu/types';

interface ServiceListProps {
    categories: Category[];
    services: Service[]; // Đây là danh sách tất cả các món (bao gồm 60', 90', 120'...)
    cart: Record<string, number>; // Lookup Map (ID -> Qty)
    lang: string;
    selectedTags?: string[]; // [NEW] Truyền tag khách chọn xuống để List biết cách sort
    onItemClick: (services: Service[]) => void; // Thay đổi: Truyền vào 1 mảng các biến thể
}

// Hàm helper map id chuẩn sang các raw tag string ở Supabase
const mapCatKeyToTagStrings = (catId: string): string[] => {
    switch (catId) {
        case 'Body': return ['body'];
        case 'Foot': return ['foot'];
        case 'Hair Wash': return ['hairwash'];
        case 'Facial': return ['face'];
        case 'Heel Skin Shave': return ['heel'];
        case 'Manicure & Pedicure': return ['nail'];
        case 'Ear Clean': return ['ear'];
        case 'Barber': return ['barber', 'shave'];
        default: return [catId.toLowerCase()];
    }
};

export default function ServiceList({ categories, services, cart, lang, selectedTags = [], onItemClick }: ServiceListProps) {

    // 1. Hàm Gộp nhóm: Gom các món có cùng Tên Tiếng Anh (names.en) vào chung 1 mảng
    const groupedServices: Record<string, Service[]> = useMemo(() => {
        const groups: Record<string, Service[]> = {};
        services.forEach(svc => {
            // [LOGIC NEW] Chỉ ẩn nếu ACTIVE = false (Hỗ trợ data cũ chưa có trường này)
            if (svc.ACTIVE === false) return;

            // Dùng tên tiếng Anh làm khóa để gộp nhóm (Normalize: Trim + Lowercase)
            const key = svc.names.en.trim().toLowerCase();
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(svc);
        });
        return groups;
    }, [services]);

    return (
        <div className="flex-1 overflow-y-auto px-4 pb-40 scroll-smooth no-scrollbar" id="service-list-container">
            {categories.map(cat => {
                // [LOGIC MỚI] FILTER & SORT
                // Bước 1: Quyết định danh sách các nhóm dịch vụ thuộc danh mục này
                let categoryGroups: Service[][] = [];
                
                if (cat.id === 'SEARCH_RESULT') {
                    // Xử lý đặc biệt cho Virtual Category (SEARCH_RESULT) khi người dùng Multi-Select
                    const rawTagsToSearch = selectedTags.flatMap(t => mapCatKeyToTagStrings(t));
                    const isSearchingBestSeller = selectedTags.includes('BestSeller');

                    const filteredGroups = Object.values(groupedServices).filter(group => {
                        const rep = group[0];
                        if (isSearchingBestSeller && rep.BEST_SELLER) return true;
                        
                        // Check if the service has AT LEAST ONE of the requested tags
                        const itemTags = rep.comboTags || [];
                        return rawTagsToSearch.some(rt => itemTags.includes(rt));
                    });

                    // Tính điểm (score) để Sorting
                    categoryGroups = filteredGroups.map(group => {
                        const rep = group[0];
                        let score = 0;
                        const itemTags = rep.comboTags || [];

                        // Ưu tiên 10 điểm nếu match BestSeller (khi có tìm bestseller)
                        if (isSearchingBestSeller && rep.BEST_SELLER) score += 10;

                        // Tìm số match: Mỗi tag match +2 điểm
                        const matchCount = rawTagsToSearch.reduce((count, rt) => count + (itemTags.includes(rt) ? 1 : 0), 0);
                        score += matchCount * 2;

                        // Phạt nhẹ nếu món này chứa thêm quá nhiều tag linh tinh ko nằm trong selected
                        // Để những món "Pure" lên trên: Pure tức là đúng chuẩn 2/2 món được chọn, không râu ria
                        const pureFactor = matchCount / (itemTags.length || 1);
                        score += pureFactor; // Điểm bonus từ 0.0 -> 1.0

                        return { group, score };
                    }).sort((a, b) => b.score - a.score).map(o => o.group);

                } else {
                    // Logic cũ cho các danh mục bình thường: check cứng theo cate id hoặc bằng comboTags 
                    const mappedRawTags = mapCatKeyToTagStrings(cat.id);
                    categoryGroups = Object.values(groupedServices).filter(group => {
                        const rep = group[0];
                        if (rep.cat === cat.id) return true;
                        if (rep.comboTags && mappedRawTags.some(t => rep.comboTags!.includes(t))) return true;
                        return false;
                    });
                }

                if (categoryGroups.length === 0) return null;

                return (
                    <div key={cat.id} id={`cat-${cat.id}`} className="mb-2 pt-2">
                        {/* Tiêu đề nhóm */}
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2 flex items-center gap-1 border-b border-gray-800 pb-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            {cat.names[lang as keyof typeof cat.names] || cat.names['en']}
                        </div>

                        {/* Grid danh sách */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid responsive: 1 cột mobile, 2 cột tablet+ */}
                            {categoryGroups.map((group) => {
                                const representative = group[0]; // Lấy món đầu tiên làm đại diện hiển thị

                                // Tính tổng số lượng của tất cả các biến thể trong nhóm này
                                // VD: Khách chọn 1 cái 60' + 1 cái 90' -> Tổng hiện thị ra ngoài là 2
                                const totalQty = group.reduce((sum, item) => sum + (cart[item.id] || 0), 0);

                                // [LOGIC NEW] Kiểm tra xem trong nhóm có item nào là Best Seller không
                                const isBestSellerGroup = group.some(item => item.BEST_SELLER === true);

                                return (
                                    <ServiceItem
                                        key={representative.id}
                                        service={representative} // Chỉ cần truyền thông tin đại diện (Tên, Ảnh)
                                        quantity={totalQty}
                                        lang={lang}
                                        isBestSeller={isBestSellerGroup} // Truyền prop mới
                                        onClick={() => onItemClick(group)} // Quan trọng: Truyền CẢ NHÓM vào để MainSheet xử lý
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
