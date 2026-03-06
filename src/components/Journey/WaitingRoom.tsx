'use client';

import React from 'react';

interface WaitingRoomProps {
    orderId: string;
    lang?: string;
}

export default function WaitingRoom({ orderId, lang = 'vi' }: WaitingRoomProps) {
    const t = {
        orderCode: lang === 'vi' ? 'Mã đơn hàng' : 'Order ID',
        preparing: lang === 'vi' ? 'Đang chuẩn bị' : 'Preparing',
        description: lang === 'vi'
            ? 'Mời bạn ngâm chân thảo dược, chườm túi nóng, uống tách trà và cho chúng tôi ít phút để chuẩn bị phòng.'
            : 'Please enjoy herbal foot bath, hot compress, sip some tea, and give us a few minutes to prepare your room.',
        process: lang === 'vi' ? 'Quy trình dịch vụ' : 'Service Process',
        step1Title: lang === 'vi' ? 'Rửa chân, tẩy da chết bằng bột thảo dược' : 'Foot wash & exfoliation with herbal powder',
        step1Sub: lang === 'vi' ? 'Làm sạch và thư giãn đôi bàn chân' : 'Cleanse and relax your feet'
    };

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
            {/* Header Image/Card */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-sm mb-8">
                <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop"
                    alt="Spa Relax"
                    className="object-cover w-full h-full opacity-90"
                />
                <div className="absolute top-4 left-4 right-4 bg-amber-400/90 backdrop-blur-md rounded-2xl py-4 flex flex-col items-center justify-center shadow-md">
                    <span className="text-amber-900 font-bold text-sm uppercase tracking-wider">{t.orderCode}</span>
                    <span className="text-3xl font-black text-amber-950 mt-1">{orderId}</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">{t.preparing}</span>
                </div>
            </div>

            {/* Message */}
            <div className="text-center px-4 mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                    {t.description}
                </h2>
            </div>


            {/* Steps */}
            <div className="w-full">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4 block">{t.process}</span>
                <div className="bg-white rounded-3xl p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <div className="w-6 h-6 border-2 border-dashed border-amber-400 rounded-lg"></div>
                    </div>
                    <div className="flex flex-col pt-1">
                        <span className="font-bold text-gray-800 text-sm leading-snug mb-1">
                            {t.step1Title}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{t.step1Sub}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
