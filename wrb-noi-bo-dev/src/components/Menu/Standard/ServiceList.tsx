'use client';
import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import ServiceItem from '@/components/Menu/Standard/ServiceItem';
import { Category, Service, CartState } from '@/components/Menu/types';

interface ServiceListProps {
    categories: Category[];
    services: Service[]; // Đây là danh sách tất cả các món (bao gồm 60', 90', 120'...)
    cart: CartState;
    lang: string;
    onItemClick: (services: Service[]) => void; // Thay đổi: Truyền vào 1 mảng các biến thể
}

export default function ServiceList({ categories, services, cart, lang, onItemClick }: ServiceListProps) {

    // 1. Hàm Gộp nhóm: Gom các món có cùng Tên Tiếng Anh (names.en) vào chung 1 mảng
    const groupedServices: Record<string, Service[]> = useMemo(() => {
        const groups: Record<string, Service[]> = {};
        services.forEach(svc => {
            // Dùng tên tiếng Anh làm khóa để gộp nhóm
            const key = svc.names.en;
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
                // Lấy danh sách các NHÓM thuộc danh mục này
                // (Chỉ cần kiểm tra món đầu tiên của nhóm xem có thuộc category này không)
                const categoryGroups = Object.values(groupedServices).filter(group => group[0].cat === cat.id);

                if (categoryGroups.length === 0) return null;

                return (
                    <div key={cat.id} id={`cat-${cat.id}`} className="mb-2 pt-2">
                        {/* Tiêu đề nhóm */}
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2 flex items-center gap-1 border-b border-gray-800 pb-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            {cat.names[lang as keyof typeof cat.names] || cat.names['en']}
                        </div>

                        {/* Grid danh sách */}
                        <div className="flex flex-col gap-4"> {/* gap-4 tạo khoảng cách giữa các món */}
                            {categoryGroups.map((group) => {
                                const representative = group[0]; // Lấy món đầu tiên làm đại diện hiển thị

                                // Tính tổng số lượng của tất cả các biến thể trong nhóm này
                                // VD: Khách chọn 1 cái 60' + 1 cái 90' -> Tổng hiện thị ra ngoài là 2
                                const totalQty = group.reduce((sum, item) => sum + (cart[item.id] || 0), 0);

                                return (
                                    <ServiceItem
                                        key={representative.id}
                                        service={representative} // Chỉ cần truyền thông tin đại diện (Tên, Ảnh)
                                        quantity={totalQty}
                                        lang={lang}
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
