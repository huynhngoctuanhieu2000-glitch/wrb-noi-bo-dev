/*
 * File: Standard/Sheets/MainSheet.tsx
 * Chức năng: Bảng chọn thời gian chi tiết (Popup chính).
 * Logic chi tiết:
 * - Render 2 chế độ:
 *   1. 'ADD': Grid các mốc thời gian (60', 90'...) để khách chọn mới.
 *   2. 'LIST': Danh sách các option đã chọn của nhóm này (nếu có).
 * - Xử lý animation slide-up (Entrance) mượt mà với state isVisible.
 * - Điều chỉnh giao diện ảnh header (tỷ lệ) tùy theo nội dung bên dưới.
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ChevronDown, List, Pencil, PlusCircle } from 'lucide-react';
import { Service, CartState } from '../../types';
import { formatCurrency } from '../../utils';

interface MainSheetProps {
    group: Service[]; // Nhận vào cả nhóm món ăn
    cart: Record<string, number>;  // Nhận vào Lookup Map
    isOpen: boolean;
    lang: string;
    onClose: () => void;
    onAddToCart: (id: string, quantity: number, options?: any) => void;
}

// DICTIONARY
const TEXT = {
    selected_options: { vn: 'Dịch vụ đã chọn', en: 'Selected Options', cn: '已选服务', jp: '選択されたサービス', kr: '선택된 서비스' },
    selected_msg: {
        vn: (n: number, name: string) => `Bạn đã chọn ${n} mục cho ${name}`,
        en: (n: number, name: string) => `You have selected ${n} options for ${name}`,
        cn: (n: number, name: string) => `您已为 ${name} 选择 ${n} 个选项`,
        jp: (n: number, name: string) => `${name} のために ${n} つのオプションを選択しました`,
        kr: (n: number, name: string) => `${name}에 대해 ${n}개의 옵션을 선택했습니다`
    },
    duration: { vn: 'THỜI LƯỢNG', en: 'DURATION', cn: '时长', jp: '期間', kr: '소요 시간' },
    qty: { vn: 'SL', en: 'Qty', cn: '数量', jp: '数量', kr: '수량' },
    pax: { vn: 'khách', en: 'pax', cn: '人', jp: '名', kr: '명' },
    add_another: { vn: 'THÊM LỰA CHỌN KHÁC', en: 'Add another option', cn: '添加其他选项', jp: '別のオプションを追加', kr: '다른 옵션 추가' },
    select_duration: { vn: 'CHỌN THỜI GIAN', en: 'Select Duration', cn: '选择时长', jp: '期間を選択', kr: '시간 선택' },
    back_to_list: { vn: 'Quay lại danh sách', en: 'Back to list', cn: '返回列表', jp: 'リストに戻る', kr: '목록으로 돌아가기' },
    view_more: { vn: 'Xem thêm', en: 'View More', cn: '查看更多', jp: 'もっと見る', kr: '더 보기' },
    update_cart: { vn: 'Cập Nhật Giỏ', en: 'Update Cart', cn: '更新购物车', jp: 'カートを更新', kr: '장바구니 업데이트' },
    add_to_cart: { vn: 'Thêm Vào Giỏ', en: 'Add to Cart', cn: '加入购物车', jp: 'カートに追加', kr: '장바구니 담기' },
    mins: { vn: 'phút', en: 'mins', cn: '分钟', jp: '分', kr: '분' },
    custom_for_you: { vn: 'Tùy chỉnh dịch vụ', en: 'Custom for you', cn: '定制服务', jp: 'カスタムサービス', kr: '맞춤 서비스' },
    custom_selected: { vn: 'Đã tùy chỉnh', en: 'Customized', cn: '已定制', jp: 'カスタマイズ済み', kr: '맞춤 설정됨' }
};

export default function MainSheet({ group, cart, isOpen, lang, onClose, onAddToCart }: MainSheetProps) {
    // Helper translate
    const t = (key: Exclude<keyof typeof TEXT, 'selected_msg'>) => {
        const dict = TEXT[key] as Record<string, string>;
        return dict[lang] || dict['en'];
    };
    // Helper translate msg (function)
    const tMsg = (n: number, name: string) => {
        const func = TEXT['selected_msg'][lang as keyof typeof TEXT['selected_msg']] || TEXT['selected_msg']['en'];
        return func(n, name);
    };

    // State lưu món đang được chọn trong nhóm (Mặc định là món đầu tiên)
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [qty, setQty] = useState(1);
    const [showAll, setShowAll] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // State cho hiệu ứng mở (Entrance Animation)

    // MODE: 'LIST' (Xem danh sách đã chọn) | 'ADD' (Thêm mới)
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD'>('ADD');

    useEffect(() => {
        if (isOpen && group.length > 0) {
            // 1. Sort lại group
            const sortedGroup = [...group].sort((a, b) => a.timeValue - b.timeValue);

            // 2. Kiểm tra xem trong cart đã có món nào thuộc group này chưa
            const purchasedItems = sortedGroup.filter(svc => cart[svc.id] && cart[svc.id] > 0);

            if (purchasedItems.length > 0) {
                // Nếu có -> Chuyển sang chế độ xem danh sách
                setViewMode('LIST');
            } else {
                // Nếu chưa -> Chuyển sang chế độ thêm mới (Chọn giờ default)
                setViewMode('ADD');
                setSelectedService(sortedGroup[0]);
                setQty(1);
            }

            setShowAll(false);
            setIsClosing(false);

            // Trigger animation mở sau khi render
            // setTimeout nhỏ để đảm bảo trình duyệt nhận diện trạng thái ban đầu (translate-y-full) trước
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen, group, cart]); // Thêm cart vào dependencies để cập nhật realtime

    if (!isOpen) return null;

    // Lọc ra danh sách các món đã mua trong group này
    const purchasedServices = group.filter(svc => cart[svc.id] && cart[svc.id] > 0);

    // Nếu đang ở mode LIST mà user lại xóa hết item trong cart -> Tự back về ADD
    if (viewMode === 'LIST' && purchasedServices.length === 0 && isOpen) {
        setViewMode('ADD');
    }

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleConfirm = () => {
        if (selectedService) {
            onAddToCart(selectedService.id, qty);
            // Sau khi add xong, nếu muốn đóng luôn thì gọi handleClose()
            // Nếu muốn quay lại list thì setViewMode('LIST') (tùy nhu cầu, ở đây mình đóng luôn cho gọn)
            handleClose();
        }
    };

    // Chuyển sang sửa 1 món cụ thể
    const handleEditItem = (svc: Service) => {
        setSelectedService(svc);
        setQty(cart[svc.id]); // Load số lượng hiện tại
        setViewMode('ADD');
    };

    // Lấy tên chung của nhóm (Lấy từ món đầu tiên)
    const representative = group[0];
    const groupName = representative?.names[lang as keyof typeof representative.names] || representative?.names['en'];

    // --- RENDER GIAO DIỆN ---
    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} />

            <div className={`
          fixed bottom-0 left-0 w-full bg-[#1e293b] rounded-t-[30px] z-50 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl
          transform transition-transform 
          duration-300  /* <-- ⏱️ CHỈNH TỐC ĐỘ Ở ĐÂY (ms) */
          ease-out      /* <-- 🌊 CHỈNH KIỂU CHUYỂN ĐỘNG (ease-in, linear...) */
          pb-safe
          ${(isClosing || !isVisible) ? 'translate-y-full' : 'translate-y-0'}
        `}>

                {/* Nút đóng */}
                <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white z-20 hover:bg-black/40 transition-colors">
                    <X size={18} />
                </button>

                {/* --- HEADER CHUNG (Ảnh nền) --- */}
                {/* Chỉ hiện ảnh to nếu ở mode ADD hoặc nếu muốn đẹp. Ở mode LIST có thể dùng header gọn hơn.
                    Tuy nhiên để đồng nhất hiệu ứng, ta vẫn giữ Header ảnh cũ nhưng có thể chỉnh title.
                */}

                {viewMode === 'ADD' && selectedService && (
                    /* 👇 CHÚ THÍCH: Chỉnh chiều cao ảnh ở đây */
                    /* Có thể dùng: aspect-video (16:9), aspect-square (1:1), hoặc h-48 (chiều cao cố định ~192px) */
                    <div className="w-full h-48 relative shrink-0">
                        <img src={selectedService.img} className="w-full h-full object-cover" alt={groupName} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-5 right-5">
                            <h2 className="text-2xl font-bold text-white font-luxury leading-tight">{groupName}</h2>
                            <p className="text-sm text-gray-300 line-clamp-1 mt-1 opacity-80">
                                {selectedService.descriptions[lang as keyof typeof selectedService.descriptions] || selectedService.descriptions['en']}
                            </p>
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 pt-4 pb-6">

                    {/* ================= MODE: LIST (Danh sách đã chọn) ================= */}
                    {viewMode === 'LIST' && (
                        <div className="px-5 pt-4">
                            <div className="flex items-center gap-3 mb-6">
                                <List className="text-yellow-500" size={24} />
                                <div>
                                    <h2 className="text-xl font-bold text-white">{t('selected_options')}</h2>
                                    <p className="text-sm text-gray-400">{tMsg(purchasedServices.length, groupName)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {purchasedServices.map(svc => (
                                    <div key={svc.id} className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors">
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-yellow-500 font-bold text-xl">{svc.timeValue}{t('mins')}</span>
                                                <span className="text-gray-500 text-xs uppercase tracking-wider">{t('duration')}</span>
                                            </div>
                                            <div className="text-white font-medium mt-1">
                                                {formatCurrency(svc.priceVND)} VND <span className="text-gray-600">/</span> <span className="text-red-400">{svc.priceUSD} USD</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                                <span>{t('qty')}:</span>
                                                <span className="text-white font-bold">{cart[svc.id]}</span>
                                                <span>{t('pax')}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleEditItem(svc)}
                                            className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all shadow-lg"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Nút Add Option */}
                            <button
                                onClick={() => {
                                    setViewMode('ADD');
                                    // Reset về cái đầu tiên chưa chọn hoặc cái đầu list
                                    const sorted = [...group].sort((a, b) => a.timeValue - b.timeValue);
                                    setSelectedService(sorted[0]);
                                    setQty(1);
                                }}
                                className="w-full mt-6 py-4 border border-dashed border-gray-600 text-gray-400 rounded-xl flex items-center justify-center gap-2 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all text-sm font-bold uppercase tracking-wide"
                            >
                                <PlusCircle size={20} />
                                <span>{t('add_another')}</span>
                            </button>
                        </div>
                    )}


                    {/* ================= MODE: ADD (Thêm/Sửa) ================= */}
                    {viewMode === 'ADD' && selectedService && (
                        <div className="px-5 mt-2">
                            {/* KHU VỰC CHỌN THỜI GIAN */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('select_duration')}</h3>

                                    {/* Nếu list có item -> Cho nút Back to list */}
                                    {purchasedServices.length > 0 && (
                                        <button onClick={() => setViewMode('LIST')} className="text-xs text-yellow-500 font-bold hover:underline">
                                            {t('back_to_list')}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {group
                                        .sort((a, b) => a.timeValue - b.timeValue)
                                        .slice(0, showAll ? undefined : 4)
                                        .map((svc) => (
                                            <button
                                                key={svc.id}
                                                onClick={() => setSelectedService(svc)}
                                                className={`
                                        flex flex-col items-center justify-center py-4 px-2 rounded-xl border transition-all relative overflow-hidden
                                        ${selectedService.id === svc.id
                                                        ? 'bg-gray-800 text-white border-yellow-500 border-2 shadow-lg shadow-yellow-500/10'
                                                        : 'bg-[#1e293b] text-gray-400 border-gray-700 hover:border-gray-500'}
                                    `}
                                            >
                                                {/* [LOGIC NEW] Badge Best Choice */}
                                                {svc.BEST_CHOICE && (
                                                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md z-10 uppercase tracking-wider">
                                                        BEST CHOICE
                                                    </div>
                                                )}

                                                <span className={`text-xl font-bold mb-1 ${selectedService.id === svc.id ? 'text-white' : 'text-gray-400'}`}>
                                                    {svc.timeValue}{t('mins')}
                                                </span>
                                                <div className="text-sm font-medium flex gap-1 items-center justify-center w-full">
                                                    <span className="text-yellow-500 font-bold">{formatCurrency(svc.priceVND)}</span>
                                                    <span className="text-gray-500">/</span>
                                                    <span className="text-red-600 font-bold">{svc.priceUSD} USD</span>
                                                </div>

                                                {/* Badge số lượng nếu đã có trong giỏ (khi đang chọn món khác) */}
                                                {cart[svc.id] > 0 && selectedService.id !== svc.id && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {cart[svc.id]}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Button View More Logic */}
                            {!showAll && group.length > 4 && (
                                <div className="flex justify-center mb-6">
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="text-gray-400 flex items-center gap-1 text-sm hover:text-white transition-colors"
                                    >
                                        <span>{t('view_more')}</span>
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER ACTION - CHỈ HIỆN Ở MODE ADD */}
                {viewMode === 'ADD' && selectedService && (
                    <div className="p-5 pt-2 bg-[#1e293b] border-t border-gray-700/50">
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center gap-6 bg-gray-800 rounded-full p-2 border border-gray-700 px-6">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"><Minus size={18} /></button>
                                <span className="text-xl font-bold text-white min-w-[30px] text-center font-mono">{qty}</span>
                                <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:bg-yellow-400 transition-colors"><Plus size={18} /></button>
                            </div>
                        </div>

                        <button onClick={handleConfirm} className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-base uppercase hover:brightness-110 transition-all">
                            <span>{cart[selectedService.id] ? t('update_cart') : t('add_to_cart')}</span>
                            <span className="opacity-40">|</span>
                            <span>{formatCurrency(selectedService.priceVND * qty)} VND</span>
                            <span className="opacity-40">/</span>
                            <span className="text-red-600 font-bold">{selectedService.priceUSD * qty} USD</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}