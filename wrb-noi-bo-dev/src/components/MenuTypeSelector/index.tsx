"use client";

import React from "react";
import styles from "./style.module.css";
import { ArrowLeft } from "lucide-react";

// Định nghĩa Props
interface Props {
    lang: string;
    onSelect: (type: 'standard' | 'vip') => void;
    onBack?: () => void;
}

// Text cứng
const texts: Record<string, any> = {
    en: { title: "Select Service Menu", std: "Standard", std_desc: "Random Staff & Room", vip: "Premium", vip_desc: "Design your own journey", btn_back: "BACK" },
    vn: { title: "Chọn Thực Đơn", std: "Tiêu Chuẩn", std_desc: "KTV & Phòng Ngẫu nhiên", vip: "Cao Cấp", vip_desc: "Tự chọn KTV & Dịch vụ", btn_back: "QUAY LẠI" },
    kr: { title: "서비스 메뉴 선택", std: "스탠다드", std_desc: "직원 및 객실 무작위", vip: "프리미엄", vip_desc: "나만의 코스 설계", btn_back: "뒤로" },
    cn: { title: "选择服务菜单", std: "标准", std_desc: "随机员工和房间", vip: "高级", vip_desc: "定制您的旅程", btn_back: "返回" },
    jp: { title: "サービスメニュー", std: "標準", std_desc: "スタッフ・部屋おまかせ", vip: "プレミアム", vip_desc: "カスタムコース", btn_back: "戻る" }
};

export default function MenuTypeSelector({ lang, onSelect, onBack }: Props) {
    const t = texts[lang] || texts['en'];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center min-h-[600px]">

            {/* 1. Header Logo & Title */}
            <div className="text-center mt-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 z-20">
                <div className="w-[120px] h-[120px] mx-auto -mb-6 relative animate-pulse">
                    {/* Logo (FIX: Restore Image) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://i.ibb.co/Y4XK7P4S/spa11.png"
                        alt="Ngan Ha Spa"
                        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                    />
                </div>
                {/* Title */}
                <p className="font-luxury text-2xl md:text-3xl text-yellow-500/90 mt-4 italic tracking-wider drop-shadow-lg">
                    {t.title}
                </p>
            </div>

            {/* 2. Books Container */}
            <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-12 mb-10 w-full z-20">

                {/* === BOOK 1: STANDARD === */}
                <div
                    onClick={() => onSelect('standard')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-left-8 delay-150 fill-mode-forwards relative`}
                >
                    <div className={`${styles.bookCover} ${styles.perspective1000} relative`}>
                        {/* Ảnh bìa */}
                        <div
                            className={styles.bgCover}
                            style={{ backgroundImage: "url('https://i.ibb.co/fV4Yzyzg/sa-ch-stand-2-500x500px.png')" }}
                        />

                        {/* Lớp phủ chứa chữ - CENTERED */}
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 pt-16">
                            <h3 className="font-luxury text-3xl font-bold text-[#4a3500] drop-shadow-sm mb-2">
                                {t.std}
                            </h3>
                            <p className="font-sans text-[10px] text-[#5c4000] font-bold uppercase tracking-wider opacity-80">
                                ({t.std_desc})
                            </p>
                            <div className="mt-2 w-8 h-0.5 bg-[#4a3500] opacity-40 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* === BOOK 2: PREMIUM === */}
                <div
                    onClick={() => onSelect('vip')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-right-8 delay-300 fill-mode-forwards relative`}
                >
                    <div className={`${styles.bookCover} ${styles.perspective1000} relative`}>
                        {/* Ảnh bìa */}
                        <div
                            className={styles.bgCover}
                            style={{ backgroundImage: "url('https://i.ibb.co/DHS0J6sK/sach-pre-500x500px.png')" }}
                        />

                        {/* Hiệu ứng Shine */}
                        <div className={styles.shineEffect} />

                        {/* Lớp phủ chứa chữ - CENTERED */}
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 pt-16">
                            <h3 className="font-luxury text-3xl font-bold text-[#ffd700] drop-shadow-[0_2px_10px_rgba(255,215,0,0.4)] mb-2">
                                {t.vip}
                            </h3>
                            <p className="font-sans text-[10px] text-yellow-100/80 font-light tracking-wider uppercase">
                                ({t.vip_desc})
                            </p>
                            <div className="mt-2 w-8 h-0.5 bg-yellow-500 opacity-60 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. Nút Back (FIX: Style Pill, Bottom) */}
            {onBack && (
                <div className="text-center pb-8 animate-in fade-in slide-in-from-bottom-8 delay-500 fill-mode-forwards z-30">
                    <button
                        onClick={onBack}
                        className="group flex items-center justify-center gap-2 px-6 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-300 shadow-lg"
                    >
                        <ArrowLeft size={16} className="text-gray-300 group-hover:text-white transition-colors" />
                        <span className="text-xs text-gray-300 group-hover:text-white uppercase tracking-widest font-medium">
                            {t.btn_back}
                        </span>
                    </button>
                </div>
            )}

        </div>
    );
};