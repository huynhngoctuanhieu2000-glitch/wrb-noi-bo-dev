'use client';

import React from 'react';
import { ServiceItem } from '@/components/Journey/useJourneyRealtime';
import { translations } from '@/components/Journey/Journey.i18n';

// 🔧 UI CONFIGURATION
const SHORT_CODE_REGEX = /^.*?-(\d{3})-.*$/; // "11NDK-020-17032026" → "020"

interface WaitingRoomProps {
    orderId: string;
    lang?: string;
    items?: ServiceItem[];
    roomName?: string | null;
    bedId?: string | null;
}

export default function WaitingRoom({ orderId, lang = 'vi', items = [], roomName, bedId }: WaitingRoomProps) {
    const t = translations[lang] || translations['en'];

    // Rút gọn mã đơn: "11NDK-020-17032026" → "020"
    const shortOrderCode = orderId.replace(SHORT_CODE_REGEX, '$1') || orderId;

    // Lộ trình steps
    const journeySteps = lang === 'vi'
        ? [
            { emoji: '🛁', title: 'Ngâm chân thảo dược', sub: 'Rửa chân, tẩy da chết bằng bột thảo dược' },
            { emoji: '💆', title: 'Thực hiện dịch vụ', sub: 'Nhân viên phục vụ tại phòng' },
            { emoji: '👜', title: 'Kiểm tra tư trang', sub: 'Kiểm tra đồ trước khi ra về' },
            { emoji: '⭐', title: 'Đánh giá dịch vụ', sub: 'Chia sẻ trải nghiệm của bạn' },
        ]
        : [
            { emoji: '🛁', title: 'Herbal Foot Soak', sub: 'Foot wash & exfoliation with herbal powder' },
            { emoji: '💆', title: 'Service in Progress', sub: 'Therapist will serve you in the room' },
            { emoji: '👜', title: 'Check Belongings', sub: 'Check your items before leaving' },
            { emoji: '⭐', title: 'Rate Your Experience', sub: 'Share your feedback with us' },
        ];

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
            {/* Hero Card: Mã đơn rút gọn */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-sm mb-6">
                <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop"
                    alt="Spa Relax"
                    className="object-cover w-full h-full opacity-90"
                />
                <div className="absolute top-4 left-4 right-4 bg-amber-400/90 backdrop-blur-md rounded-2xl py-4 flex flex-col items-center justify-center shadow-md">
                    <span className="text-amber-900 font-bold text-xs uppercase tracking-wider">
                        {lang === 'vi' ? 'Mã đơn hàng' : 'Order ID'}
                    </span>
                    <span className="text-5xl font-black text-amber-950 mt-1">{shortOrderCode}</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">
                        {lang === 'vi' ? 'Đang chuẩn bị' : 'Preparing'}
                    </span>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center px-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
                    {lang === 'vi'
                        ? 'Mời bạn ngâm chân thảo dược, chườm túi nóng, uống tách trà và cho chúng tôi ít phút để chuẩn bị phòng.'
                        : 'Please enjoy herbal foot bath, hot compress, sip some tea, and give us a few minutes to prepare your room.'}
                </h2>
            </div>

            {/* ─── Dịch vụ hôm nay ─── */}
            {items.length > 0 && (
                <div className="w-full mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-3 block">
                        {t.todayServices || "Today's Services"}
                    </span>
                    <div className="space-y-2">
                        {items.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">💆</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm leading-tight truncate">
                                        {item.service_name}
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                                        {item.duration} {t.minutes || 'min'}
                                        {item.technicianCode && ` · ${t.staff || 'NV'}: ${item.technicianCode}`}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    {(item.roomName || roomName) && (
                                        <p className="text-xs font-bold text-amber-600">
                                            {t.room || 'Room'} {item.roomName || roomName}
                                        </p>
                                    )}
                                    {(item.bedId || bedId) && (
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {t.bed || 'Bed'} {item.bedId || bedId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Lộ trình dịch vụ ─── */}
            <div className="w-full">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-3 block">
                    {lang === 'vi' ? 'Lộ trình dịch vụ' : 'Your Journey'}
                </span>
                <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    {journeySteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                    idx === 0 ? 'bg-amber-100 border-2 border-amber-300' : 'bg-gray-50 border border-gray-200'
                                }`}>
                                    {step.emoji}
                                </div>
                                {idx < journeySteps.length - 1 && (
                                    <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
                                )}
                            </div>
                            <div className="pt-1.5 flex-1 min-w-0">
                                <p className={`font-bold text-sm ${idx === 0 ? 'text-amber-800' : 'text-gray-600'}`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{step.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
