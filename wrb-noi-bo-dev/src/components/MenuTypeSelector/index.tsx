"use client";

import React from "react";
import styles from "./style.module.css";
import { ArrowLeft } from "lucide-react";

interface Props {
    lang: string;
    onSelect: (type: 'standard' | 'vip') => void;
    onBack?: () => void;
}

const texts: Record<string, any> = {
    en: { title: "Select Service Menu", std: "Standard", std_desc: "(Random Staff & Room)", vip: "Premium", vip_desc: "(Design your own journey)", btn_back: "Back" },
    vn: { title: "Chọn Thực Đơn", std: "Tiêu Chuẩn", std_desc: "(KTV & Phòng Ngẫu nhiên)", vip: "Cao Cấp", vip_desc: "(Tự chọn KTV & Dịch vụ)", btn_back: "Quay lại" },
    kr: { title: "서비스 메뉴 선택", std: "스탠다드", std_desc: "(직원 및 객실 무작위)", vip: "프리미엄", vip_desc: "(나만의 코스 설계)", btn_back: "돌아가기" },
    cn: { title: "选择服务菜单", std: "标准", std_desc: "(随机员工和房间)", vip: "高级", vip_desc: "(定制您的旅程)", btn_back: "返回" },
    jp: { title: "サービスメニュー", std: "標準", std_desc: "(スタッフ・部屋おまかせ)", vip: "プレミアム", vip_desc: "(カスタムコース)", btn_back: "戻る" }
};

export default function MenuTypeSelector({ lang, onSelect, onBack }: Props) {
    const t = texts[lang] || texts['en'];

    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center py-10 relative z-10">

            {/* 1. HEADER */}
            <div className="text-center mb-[60px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-[140px] h-[140px] mx-auto -mb-[20px] relative animate-pulse z-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://i.ibb.co/Y4XK7P4S/spa11.png"
                        alt="Ngan Ha Spa"
                        className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]"
                    />
                </div>
                <p className="font-luxury text-3xl md:text-4xl text-yellow-500/90 mt-[5px] italic tracking-wider drop-shadow-lg relative z-20">
                    {t.title}
                </p>
            </div>

            {/* 2. BOOKS CONTAINER */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-16 mt-[-60px] mb-[20px] w-full">

                {/* === BOOK 1: STANDARD === */}
                <div
                    onClick={() => onSelect('standard')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-left-8 delay-150 fill-mode-forwards relative`}
                >
                    <div className={`${styles.bookCover} ${styles.perspective1000} relative`}>
                        <div
                            className={styles.bgCover}
                            style={{ backgroundImage: "url('https://i.ibb.co/fV4Yzyzg/sa-ch-stand-2-500x500px.png')" }}
                        />

                        {/* ✅ VÙNG GIẤY VIẾT (STANDARD) */}
                        {/* left-[17%]: Bắt đầu từ sau gáy lò xo */}
                        {/* w-[78%]: Chiều rộng còn lại của trang giấy */}
                        {/* top-[26%]: Bắt đầu từ dưới cái hoa văn trang trí */}
                        {/* flex items-center justify-center: Căn chữ vào GIỮA VÙNG GIẤY NÀY */}
                        <div className="absolute left-[14%] top-[26%] w-[78%] h-[55%] z-20 flex flex-col items-center justify-center text-center">

                            <h3 className="font-luxury text-4xl md:text-5xl font-bold text-[#4a3800] drop-shadow-sm leading-tight mb-2 w-full">
                                {t.std}
                            </h3>

                            <p className="font-bold-body text-[13px] text-[#5c4000] font-semibold w-full px-2">
                                {t.std_desc}
                            </p>

                            <div className="mt-3 w-12 h-0.5 bg-[#4a3500] opacity-50 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* === BOOK 2: PREMIUM === */}
                <div
                    onClick={() => onSelect('vip')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-right-8 delay-300 fill-mode-forwards relative`}
                >
                    <div className={`${styles.bookCover} ${styles.perspective1000} relative`}>
                        <div
                            className={styles.bgCover}
                            style={{ backgroundImage: "url('https://i.ibb.co/DHS0J6sK/sach-pre-500x500px.png')" }}
                        />
                        <div className={styles.shineEffect} />

                        {/* ✅ VÙNG GIẤY VIẾT (PREMIUM) */}
                        {/* left-[17%]: Giống bên trên, né gáy lò xo */}
                        {/* top-[34%]: Hạ thấp hơn vì Logo Vương Miện to hơn */}
                        <div className="absolute left-[14%] top-[34%] w-[78%] h-[50%] z-20 flex flex-col items-center justify-center text-center">

                            <h3 className="font-luxury text-4xl md:text-5xl font-bold text-[#ffd700] drop-shadow-[0_2px_10px_rgba(255,215,0,0.4)] leading-tight mb-3 w-full">
                                {t.vip}
                            </h3>

                            <p className="font-bold-body text-[15px] text-[#ffffff] font-semibold w-full px-2">
                                {t.vip_desc}
                            </p>

                            <div className="mt-4 w-12 h-0.5 bg-yellow-500 opacity-60 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. NÚT BACK */}
            {onBack && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-8 delay-500 fill-mode-forwards z-30 pb-12">
                    <button
                        onClick={onBack}
                        className="group relative flex items-center justify-center gap-4 px-10 py-4 rounded-full border border-yellow-500/30 bg-black/40 backdrop-blur-md hover:bg-yellow-950/30 hover:border-yellow-400 transition-all duration-500 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]"
                    >
                        <ArrowLeft
                            size={20}
                            className="text-yellow-500/80 group-hover:text-yellow-300 transition-transform duration-300 group-hover:-translate-x-1"
                        />
                        <span className="text-sm text-yellow-50/90 group-hover:text-white uppercase tracking-[0.25em] font-semibold transition-colors duration-300">
                            {t.btn_back}
                        </span>
                    </button>
                </div>
            )}

        </div>
    );
};