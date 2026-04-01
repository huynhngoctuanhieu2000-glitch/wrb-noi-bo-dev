import React, { useMemo } from 'react';
import Image from 'next/image';
import { Check, Ban } from 'lucide-react';
import { BodyPartKey, LanguageCode, MultiLangText, ServiceData } from './types';
import { getText } from './utils';
import { getDictionary } from '@/lib/dictionaries';

// ============================================================================
// 🔧 UI CONFIGURATION AREA (TINH CHỈNH ẢNH VÀ MASK TẠI ĐÂY)
// ============================================================================
// Hệ tọa độ Clip-path cho 8 vừng cơ bản trên Body Avatar
// Định dạng: polygon(top-left, top-right, bottom-right, bottom-left)
// Bạn có thể tự do thay đổi % để vùng chọn Xanh/Đỏ vừa khít viền cơ thể!
const BODY_MASKS: Record<BodyPartKey, React.CSSProperties[]> = {
    // ✅ FINALIZED - Tọa độ đã được căn chỉnh khớp body-map.webp
    // Đầu: 0–20%  │  Cổ: 19–22%  │  Vai: 21–26%  │  Tay: 26–66%
    // Lưng: 26–53%  │  Đùi: 52.5–68%  │  Bắp chân: 67.9–82%  │  Bàn chân: 82–100%

    HEAD: [{ clipPath: 'polygon(26% 0%, 74% 0%, 74% 20%, 26% 20%)' }],                    // Đầu: 0–20%
    NECK: [{ clipPath: 'polygon(38% 19%, 62% 19%, 62% 22%, 38% 22%)' }],                   // Cổ: 19–22% (hẹp ngang)
    SHOULDER: [{ clipPath: 'polygon(12% 21%, 88% 21%, 88% 26%, 12% 26%)' }],                   // Vai: 21–26% (rộng 2 bên)
    ARM: [
        { clipPath: 'polygon(0% 26%, 26% 26%, 26% 66%, 0% 66%)' },                            // Tay trái: 0–26% ngang, 26–66% dọc
        { clipPath: 'polygon(70% 26%, 100% 26%, 100% 66%, 70% 66%)' }                         // Tay phải: 70–100% ngang, 26–66% dọc
    ],
    BACK: [{ clipPath: 'polygon(25% 26%, 73% 26%, 77% 53%, 25% 53%)' }],                   // Lưng & Bụng: 26–53%
    THIGH: [{ clipPath: 'polygon(20% 52.5%, 75.5% 52.5%, 75.5% 68%, 24% 68%)' }],          // Đùi: 52.5–68%
    CALF: [{ clipPath: 'polygon(21% 67.9%, 79% 67.9%, 79% 82%, 21% 82%)' }],              // Bắp chân: 67.9–82%
    FOOT: [{ clipPath: 'polygon(18% 81.7%, 82% 81.7%, 82% 100%, 18% 100%)' }],                // Bàn chân: 82–100%
};

const ALL_BODY_PARTS: { key: BodyPartKey; height: string }[] = [
    { key: 'HEAD', height: '10%' },
    { key: 'NECK', height: '8%' },
    { key: 'SHOULDER', height: '12%' },
    { key: 'ARM', height: '10%' },
    { key: 'BACK', height: '12%' },
    { key: 'THIGH', height: '17%' },
    { key: 'CALF', height: '15%' },
    { key: 'FOOT', height: '10%' },
];

const LAYOUT_CONFIG = {
    checklist: {
        gap: "4px",
        paddingRight: "0px",
        checkboxSize: "22px",
    }
};
// ============================================================================

interface BodyMapProps {
    focus: string[];
    avoid: string[];
    lang: LanguageCode;
    serviceData: ServiceData;
    onToggle: (type: 'focus' | 'avoid', area: string) => void;
}

const BodyMap: React.FC<BodyMapProps> = ({ focus, avoid, lang, serviceData, onToggle }) => {
    const dict = getDictionary(lang);

    // 1. Phân quyền hiển thị
    const availableParts = ALL_BODY_PARTS.filter(part => {
        if (!serviceData.FOCUS_POSITION) return true;
        return serviceData.FOCUS_POSITION[part.key] === true;
    });

    const isFullBody = availableParts.length > 0 && focus.length === availableParts.length;

    const handleFullBodyToggle = () => {
        if (isFullBody) {
            onToggle('focus', 'CLEAR_ALL');
        } else {
            onToggle('focus', 'FULL_BODY');
        }
    };

    // Style Mask động để tái sử dụng
    const maskStyle = useMemo(() => ({
        maskImage: `url('/assets/icons/body-map.webp')`,
        maskSize: 'contain',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        WebkitMaskImage: `url('/assets/icons/body-map.webp')`,
        WebkitMaskSize: 'contain',
        WebkitMaskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
    }), []);

    if (availableParts.length === 0) return null;

    return (
        <div className="flex gap-2 h-[450px]">
            {/* CỘT TRÁI: Nút Toàn Thân (15%) */}
            <div className="w-[15%] flex flex-col items-center justify-center border-r border-dashed border-gray-200 pr-2">
                {availableParts.length > 1 && (
                    <label className="flex flex-col items-center justify-center cursor-pointer bg-white p-2 rounded-xl border border-green-200 transition-all hover:bg-green-50 active:scale-95 group shadow-sm py-4 w-full">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors border-2 ${isFullBody ? 'bg-green-500 border-green-500' : 'bg-white border-green-300'}`}>
                            <Check className={`w-5 h-5 text-white transition-opacity ${isFullBody ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isFullBody}
                                onChange={handleFullBodyToggle}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-green-600 uppercase leading-snug text-center tracking-tight">
                            {getText({ en: 'Whole\nBody', vi: 'Toàn\nThân', jp: '全身', kr: '전신', cn: '全身' }, lang)}
                        </span>
                    </label>
                )}
            </div>

            {/* CỘT GIỮA: Màn Hình Cơ Thể - Đỉnh cao tương tác (40%) */}
            <div className="w-[40%] h-full relative flex items-center justify-center pl-2">
                {/* 
                  YÊU CẦU: "ẩn cái hình đi sao đó để mặc định là màu đen, ấn cái vùng nào thì đổi màu vùng đó"
                  GIẢI PHÁP: 
                  - Xóa thẻ <Image /> hiển thị gốc.
                  - Render toàn bộ 8 mảnh ghép Mask mọi lúc.
                  - Mặc định:bg-black. Chọn Focus: bg-green, Avoid: bg-red.
                  => Tập hợp 8 mảnh ghép sẽ tự động xếp khít thành 1 Body hoàn chỉnh nét căng!
                */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-full h-[100%] max-w-[220px]">
                        {ALL_BODY_PARTS.map(part => {
                            const isAvailable = availableParts.find(p => p.key === part.key);
                            const isFocus = focus.includes(part.key);
                            const isAvoid = avoid.includes(part.key);

                            // Phân loại màu: 
                            // - Xanh lá (Focus)
                            // - Đỏ (Avoid)
                            // - Đen nhánh (Mặc định)
                            // - Xám nhạt (Vô hiệu hóa)
                            let colorClass = 'bg-gray-200/50';
                            if (isAvailable) {
                                if (isFocus) colorClass = 'bg-[#16a34a]';
                                else if (isAvoid) colorClass = 'bg-[#ef4444]';
                                else colorClass = 'bg-[#1f2937] hover:bg-gray-600'; // Màu Đen xám xịn (Slate 800)
                            }

                            const clipStyles = BODY_MASKS[part.key];

                            return clipStyles.map((clipStyle, index) => (
                                <div
                                    key={`${part.key}-${index}`}
                                    className={`absolute inset-0 ${colorClass} transition-colors duration-300 pointer-events-none`}
                                    style={{
                                        ...maskStyle,
                                        ...clipStyle
                                    }}
                                />
                            ));
                        })}
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: Bảng Danh Sách Trượt Checklist (45%) */}
            <div className="w-[45%] flex flex-col h-full pl-2">
                <div
                    className="flex flex-row items-center text-[9px] font-bold uppercase tracking-tight pb-1 border-b border-gray-100 flex-none mb-1 pt-0"
                    style={{ marginRight: LAYOUT_CONFIG.checklist.paddingRight }}
                >
                    <span className="text-gray-400 flex-1">{getText({ en: 'Area', vi: 'Vị trí', jp: '部位', kr: '부위', cn: '区域' }, lang)}</span>
                    <div className="flex justify-end gap-1 w-[60px]">
                        <span className="text-green-600 w-7 text-center">{getText({ en: 'Focus', vi: 'Tập\ntrung', jp: '集中', kr: '집중', cn: '重点' }, lang)}</span>
                        <span className="text-red-500 w-7 text-center">{getText({ en: 'Avoid', vi: 'Tránh', jp: '避ける', kr: '피하다', cn: '避开' }, lang)}</span>
                    </div>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar" style={{ marginRight: LAYOUT_CONFIG.checklist.paddingRight }}>
                    {ALL_BODY_PARTS.map((part) => {
                        const isAvailable = availableParts.find(p => p.key === part.key);
                        const isFocus = focus.includes(part.key);
                        const isAvoid = avoid.includes(part.key);

                        return (
                            <div
                                key={part.key}
                                className={`w-full flex items-center px-1 border-b border-transparent py-[6px] ${isAvailable
                                    ? 'hover:bg-gray-50 rounded transition-colors justify-between'
                                    : 'pointer-events-none opacity-30 grayscale'
                                    }`}
                            >
                                {isAvailable ? (
                                    <>
                                        <span className={`text-[12px] flex-1 truncate font-semibold ${isFocus ? 'text-green-700' : isAvoid ? 'text-red-700' : 'text-gray-700'}`}>
                                            {getText({
                                                HEAD: { en: 'Head', vi: 'Đầu', jp: '頭', kr: '머리', cn: '头' },
                                                NECK: { en: 'Neck', vi: 'Cổ', jp: '首', kr: '목', cn: '颈部' },
                                                SHOULDER: { en: 'Shoulder', vi: 'Vai', jp: '肩', kr: '어깨', cn: '肩部' },
                                                ARM: { en: 'Arm', vi: 'Tay', jp: '腕', kr: '팔', cn: '手臂' },
                                                BACK: { en: 'Back', vi: 'Lưng', jp: '背中', kr: '등', cn: '背部' },
                                                THIGH: { en: 'Thigh', vi: 'Đùi', jp: '太もも', kr: '허벅지', cn: '大腿' },
                                                CALF: { en: 'Calf', vi: 'Bắp chân', jp: 'ふくらはぎ', kr: '종아리', cn: '小腿' },
                                                FOOT: { en: 'Foot', vi: 'Bàn chân', jp: '足', kr: '발', cn: '脚' },
                                            }[part.key] as MultiLangText, lang)}
                                        </span>
                                        {/* Hai ô checkbox Xanh - Đỏ */}
                                        <div className="flex items-center justify-end gap-1 w-[60px]">
                                            <label className="relative flex items-center justify-center cursor-pointer w-7 group">
                                                <input
                                                    type="checkbox"
                                                    checked={isFocus}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        onToggle('focus', part.key);
                                                    }}
                                                    style={{ width: LAYOUT_CONFIG.checklist.checkboxSize, height: LAYOUT_CONFIG.checklist.checkboxSize }}
                                                    className="peer appearance-none border-2 border-gray-200 rounded bg-white checked:bg-green-500 checked:border-green-500 transition-all"
                                                />
                                            </label>

                                            <label className="relative flex items-center justify-center cursor-pointer w-7 group">
                                                <input
                                                    type="checkbox"
                                                    checked={isAvoid}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        onToggle('avoid', part.key);
                                                    }}
                                                    style={{ width: LAYOUT_CONFIG.checklist.checkboxSize, height: LAYOUT_CONFIG.checklist.checkboxSize }}
                                                    className="peer appearance-none border-2 border-gray-200 rounded bg-white checked:bg-red-500 checked:border-red-500 transition-all"
                                                />
                                            </label>
                                        </div>
                                    </>

                                ) : (
                                    <span className="text-[11px] text-gray-300 italic flex-1 py-1">
                                        {getText({
                                            HEAD: { en: 'Head', vi: 'Đầu', jp: '頭', kr: '머리', cn: '头' },
                                            NECK: { en: 'Neck', vi: 'Cổ', jp: '首', kr: '목', cn: '颈部' },
                                            SHOULDER: { en: 'Shoulder', vi: 'Vai', jp: '肩', kr: '어깨', cn: '肩部' },
                                            ARM: { en: 'Arm', vi: 'Tay', jp: '腕', kr: '팔', cn: '手臂' },
                                            BACK: { en: 'Back', vi: 'Lưng', jp: '背中', kr: '등', cn: '背部' },
                                            THIGH: { en: 'Thigh', vi: 'Đùi', jp: '太もも', kr: '허벅지', cn: '大腿' },
                                            CALF: { en: 'Calf', vi: 'Bắp chân', jp: 'ふくらはぎ', kr: '종아리', cn: '小腿' },
                                            FOOT: { en: 'Foot', vi: 'Bàn chân', jp: '足', kr: '발', cn: '脚' },
                                        }[part.key] as MultiLangText, lang)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BodyMap;
