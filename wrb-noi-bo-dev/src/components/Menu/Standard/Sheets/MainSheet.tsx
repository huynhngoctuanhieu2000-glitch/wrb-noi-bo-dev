'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Clock, ChevronDown } from 'lucide-react';
import { Service } from '../../types'; // Import từ file types vừa sửa
import { formatCurrency } from '../../utils';

interface MainSheetProps {
    group: Service[]; // Nhận vào cả nhóm món ăn
    isOpen: boolean;
    lang: string;
    onClose: () => void;
    onAddToCart: (id: string, quantity: number) => void;
}

export default function MainSheet({ group, isOpen, lang, onClose, onAddToCart }: MainSheetProps) {
    // State lưu món đang được chọn trong nhóm (Mặc định là món đầu tiên)
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [qty, setQty] = useState(1);
    const [showAll, setShowAll] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen && group.length > 0) {
            // Sắp xếp nhóm theo thời gian tăng dần để hiển thị đẹp (60 -> 90 -> 120)
            const sortedGroup = [...group].sort((a, b) => a.timeValue - b.timeValue);
            setSelectedService(sortedGroup[0]); // Mặc định chọn gói thời gian thấp nhất
            setQty(1);
            setShowAll(false);
            setIsClosing(false);
        }
    }, [isOpen, group]);

    if (!selectedService || !isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleConfirm = () => {
        if (selectedService) {
            onAddToCart(selectedService.id, qty);
            handleClose();
        }
    };

    // Lấy thông tin hiển thị
    const name = selectedService.names[lang as keyof typeof selectedService.names] || selectedService.names['en'];
    const desc = selectedService.descriptions[lang as keyof typeof selectedService.descriptions] || selectedService.descriptions['en'];

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} />

            <div className={`
          fixed bottom-0 left-0 w-full bg-[#1e293b] rounded-t-[30px] z-50 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl
          transform transition-transform duration-300 ease-out pb-safe
          ${isClosing ? 'translate-y-full' : 'translate-y-0'}
        `}>

                {/* Nút đóng */}
                <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white z-20">
                    <X size={18} />
                </button>

                <div className="overflow-y-auto flex-1 pb-4">
                    {/* Ảnh */}
                    <div className="w-full aspect-video relative">
                        <img src={selectedService.img} className="w-full h-full object-cover" alt={name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
                    </div>

                    <div className="px-5 -mt-8 relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-2 font-luxury">{name}</h2>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">{desc}</p>

                        {/* --- KHU VỰC CHỌN THỜI GIAN (LOGIC MỚI) --- */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Please select time</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {group
                                    .sort((a, b) => a.timeValue - b.timeValue)
                                    .slice(0, showAll ? undefined : 4) // Logic hiển thị theo state showAll
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
                                            <span className={`text-xl font-bold mb-1 ${selectedService.id === svc.id ? 'text-white' : 'text-gray-400'}`}>
                                                {svc.timeValue}mins
                                            </span>
                                            <div className="text-sm font-medium flex gap-1 items-center justify-center w-full">
                                                <span className="text-yellow-500 font-bold">{formatCurrency(svc.priceVND)}</span>
                                                <span className="text-gray-500">/</span>
                                                <span className="text-red-500 font-bold">{svc.priceUSD} USD</span>
                                            </div>
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
                                    <span>View More</span>
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        )}

                        {/* Price display removed as per design request (moved inside buttons) */}
                        {/* <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700"> ... </div> */}
                    </div>
                </div>

                {/* Footer: Số lượng & Add */}
                <div className="p-5 pt-2 bg-[#1e293b] border-t border-gray-700/50">
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center gap-6 bg-gray-800 rounded-full p-2 border border-gray-700 px-6">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"><Minus size={18} /></button>
                            <span className="text-xl font-bold text-white min-w-[30px] text-center font-mono">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:bg-yellow-400 transition-colors"><Plus size={18} /></button>
                        </div>
                    </div>

                    <button onClick={handleConfirm} className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-base uppercase">
                        <span>Add to Cart</span>
                        <span className="opacity-40">|</span>
                        <span>{formatCurrency(selectedService.priceVND * qty)} VND</span>
                        <span className="opacity-40">/</span>
                        <span className="text-red-600 font-bold">{selectedService.priceUSD * qty} USD</span>
                    </button>
                </div>
            </div>
        </>
    );
}