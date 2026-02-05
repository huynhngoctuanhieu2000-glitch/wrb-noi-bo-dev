/*
 * File: Standard/ServiceItem.tsx
 * Chức năng: Card hiển thị thông tin tóm tắt của một nhóm dịch vụ (Service Group).
 * Logic chi tiết:
 * - Hiển thị ảnh đại diện, tên dịch vụ (đa ngôn ngữ), và khoảng giá (Min - Max).
 * - Xử lý sự kiện click để mở MainSheet cho nhóm dịch vụ này.
 * - Hiển thị badge số lượng nếu đã có item trong giỏ hàng.
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
'use client';
import React from 'react';
import { Plus } from 'lucide-react';
import { Service } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface ServiceItemProps {
    service: Service;
    quantity: number;
    lang: string;
    onClick: () => void;
}

export default function ServiceItem({ service, quantity, lang, onClick }: ServiceItemProps) {
    const name = service.names[lang as keyof typeof service.names] || service.names['en'];
    const desc = service.descriptions[lang as keyof typeof service.descriptions] || service.descriptions['en'];
    const isSelected = quantity > 0;

    return (
        <div
            onClick={onClick}
            className={`
        relative w-full rounded-2xl p-3 flex flex-row gap-4 items-center overflow-hidden
        transition-all duration-300 cursor-pointer active:scale-[0.98]
        ${isSelected ? 'bg-[#263345] border border-yellow-500/30' : 'bg-[#1e293b] border border-transparent'}
        shadow-lg hover:bg-[#263345]
      `}
        >
            {/* 1. Ảnh vuông bo tròn */}
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-800 relative shadow-sm">
                <img
                    src={service.img}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt={name}
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=SPA')}
                />
            </div>

            {/* 2. Nội dung text (Không hiện giá) */}
            <div className="flex flex-col justify-center flex-1 min-w-0 pr-12 py-1 h-20">
                <h3 className="font-bold text-white text-[15px] leading-tight mb-1.5 line-clamp-2 font-luxury tracking-wide">
                    {name}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-light">
                    {desc}
                </p>
            </div>

            {/* 3. Nút Cộng / Badge số lượng (Góc dưới phải tuyệt đối) */}
            <div className="absolute bottom-3 right-3 z-10">
                {isSelected ? (
                    // Nếu đã chọn: Hiện số lượng màu vàng
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-black font-extrabold text-sm flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-[pop_0.2s_ease-out]">
                        {quantity}
                    </div>
                ) : (
                    // Chưa chọn: Hiện nút Plus xám tròn
                    <div className="w-9 h-9 rounded-full bg-gray-700/80 text-yellow-500 flex items-center justify-center backdrop-blur-sm hover:bg-gray-600 hover:text-white transition-colors">
                        <Plus size={18} strokeWidth={2.5} />
                    </div>
                )}
            </div>
        </div>
    );
}