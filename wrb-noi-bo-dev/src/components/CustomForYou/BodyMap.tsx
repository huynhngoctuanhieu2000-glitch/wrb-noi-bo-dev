import React from 'react';
import Image from 'next/image';
import { Check, Ban } from 'lucide-react';
import { BodyPartKey, LanguageCode, MultiLangText, ServiceData } from './types';
import { getText } from './utils';
import { getDictionary } from '@/lib/dictionaries';

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

interface BodyMapProps {
    focus: string[];
    avoid: string[];
    lang: LanguageCode;
    serviceData: ServiceData; // Dữ liệu dịch vụ để config hiển thị
    onToggle: (type: 'focus' | 'avoid', area: string) => void;
}

const BodyMap: React.FC<BodyMapProps> = ({ focus, avoid, lang, serviceData, onToggle }) => {
    const dict = getDictionary(lang);

    // 1. Lọc ra các bộ phận được phép hiển thị dựa trên Service Data
    // Nếu FOCUS_POSITION không có -> mặc định hiện hết
    const availableParts = ALL_BODY_PARTS.filter(part => {
        if (!serviceData.FOCUS_POSITION) return true;
        return serviceData.FOCUS_POSITION[part.key] === true;
    });

    const isFullBody = availableParts.length > 0 && focus.length === availableParts.length;

    // Handle toggle Full Body logic
    const handleFullBodyToggle = () => {
        if (isFullBody) {
            // Đang full -> Tắt hết
            onToggle('focus', 'CLEAR_ALL');
        } else {
            // Chưa full -> Bật hết các part có sẵn
            const allKeys = availableParts.map(p => p.key);
            // Chúng ta cần gọi onToggle đặc biệt hoặc loop. 
            // Ở đây giả sử parent xử lý logic 'FULL_BODY' event
            onToggle('focus', 'FULL_BODY');
        }
    };

    if (availableParts.length === 0) return null;

    return (
        <div className="flex gap-2 h-[450px]">
            {/* Full Body Toggle Column */}
            <div className="w-[10%] flex flex-col items-center border-r border-dashed border-gray-200 pr-1 h-full justify-start pt-[120px]">
                {/* Only show toggle if more than 1 part is available */}
                {availableParts.length > 1 && (
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer bg-green-50 p-2 rounded-lg border border-green-200 transition-all hover:bg-green-100 active:scale-95 group w-full shadow-sm py-4 h-fit">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="peer appearance-none w-6 h-6 border-2 border-green-300 rounded-lg bg-white checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer"
                                checked={isFullBody}
                                onChange={handleFullBodyToggle}
                            />
                            <Check className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-[9px] font-bold text-green-700 uppercase leading-tight text-center">
                            {availableParts.length === ALL_BODY_PARTS.length ? (
                                // Logic cũ: Full Body
                                isFullBody ? (
                                    <>{dict.custom_for_you?.full_body}</>
                                ) : (
                                    focus.length > 0 ? <>{dict.custom_for_you?.partly}</> : <>{dict.custom_for_you?.full_body}</>
                                )
                            ) : (
                                // Logic mới: Select All
                                isFullBody ? (
                                    getText({ en: 'All', vn: 'Tất cả', jp: 'すべて', kr: '모두', cn: '全部' }, lang)
                                ) : (
                                    focus.length > 0 ? <>{dict.custom_for_you?.partly}</> : getText({ en: 'Select All', vn: 'Chọn Hết', jp: 'すべて選択', kr: '모두 선택', cn: '全选' }, lang)
                                )
                            )}
                        </span>
                    </label>
                )}
            </div>

            {/* Body Illustration */}
            <div className="w-[50%] h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative flex items-start justify-center group pt-6">
                <Image
                    src="https://i.ibb.co/p6bqd0Zg/icon-hi-nh-ng-i.webp"
                    alt="Body Map"
                    width={220}
                    height={500}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                />
            </div>

            {/* Selectors Column */}
            <div className="w-[40%] flex flex-col h-full">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight pb-0 border-b border-gray-100 flex-none mb-0 pt-0">
                    <span className="text-gray-400 flex-1">{getText({ en: 'Area', vn: 'Vị trí', jp: '部位', kr: '부위', cn: '区域' }, lang)}</span>
                    <div className="flex gap-3">
                        <span className="text-green-600 w-6 text-center">{getText({ en: 'Focus', vn: 'Tập trung', jp: '集中', kr: '집중', cn: '重点' }, lang)}</span>
                        <span className="text-red-500 w-12 text-center">{getText({ en: 'Avoid', vn: 'Tránh', jp: '避ける', kr: '피하다', cn: '避开' }, lang)}</span>
                    </div>
                </div>

                <div className="flex flex-col pr-1 h-full overflow-y-auto custom-scrollbar">
                    {ALL_BODY_PARTS.map((part) => {
                        // Check xem part này có được enable trong service không
                        const isAvailable = availableParts.find(p => p.key === part.key);

                        const isFocus = focus.includes(part.key);
                        const isAvoid = avoid.includes(part.key);

                        return (
                            <div
                                key={part.key}
                                style={{ height: part.height }}
                                className={`w-full flex items-center px-1 border-b border-transparent ${isAvailable
                                    ? 'border-gray-50 hover:bg-gray-50 rounded transition-colors justify-between'
                                    : 'pointer-events-none opacity-30 grayscale'
                                    }`}
                            >
                                {isAvailable ? (
                                    <>
                                        <span className="text-[13px] font-bold text-gray-700 flex-1 truncate">
                                            {getText({
                                                HEAD: { en: 'Head', vn: 'Đầu', jp: '頭', kr: '머리', cn: '头' },
                                                NECK: { en: 'Neck', vn: 'Cổ', jp: '首', kr: '목', cn: '颈部' },
                                                SHOULDER: { en: 'Shoulder', vn: 'Vai', jp: '肩', kr: '어깨', cn: '肩部' },
                                                ARM: { en: 'Arm', vn: 'Tay', jp: '腕', kr: '팔', cn: '手臂' },
                                                BACK: { en: 'Back', vn: 'Lưng', jp: '背中', kr: '등', cn: '背部' },
                                                THIGH: { en: 'Thigh', vn: 'Đùi', jp: '太もも', kr: '허벅지', cn: '大腿' },
                                                CALF: { en: 'Calf', vn: 'Bắp chân', jp: 'ふくらはぎ', kr: '종아리', cn: '小腿' },
                                                FOOT: { en: 'Foot', vn: 'Bàn chân', jp: '足', kr: '발', cn: '脚' },
                                            }[part.key] as MultiLangText, lang)}
                                        </span>
                                        <div className="flex gap-3">
                                            {/* Focus Checkbox */}
                                            <label className="relative flex items-center justify-center cursor-pointer w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={isFocus}
                                                    onChange={() => onToggle('focus', part.key)}
                                                    className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-md bg-white checked:bg-green-500 checked:border-green-500 transition-all"
                                                />
                                                <Check className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                            </label>

                                            {/* Avoid Checkbox (Always visible and clickable) */}
                                            <label className="relative flex items-center justify-center w-8 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAvoid}
                                                    onChange={() => onToggle('avoid', part.key)}
                                                    className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-md bg-white checked:bg-red-500 checked:border-red-500 transition-all"
                                                />
                                                <Ban className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    // Placeholder cho phần bị ẩn/disabled
                                    <span className="text-[11px] text-gray-300 italic flex-1">
                                        -- N/A --
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
