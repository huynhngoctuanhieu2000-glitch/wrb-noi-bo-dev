"use client";

import React from "react";
import Image from "next/image";
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
        <div className="flex flex-col items-center justify-center">

            {/* 1. HEADER */}
            <div className="text-center mb-[60px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-[450px] h-[140px] mx-auto -mb-[20px] relative animate-pulse z-10">
                    {/* ES Lint disable was here, removed as we use Next Image */}
                    <div className="relative w-full h-full">
                        <Image
                            src="/assets/logos/logo-gold.webp"
                            alt="Ngan Ha Spa"
                            fill
                            className="object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]"
                            priority
                            sizes="(max-width: 768px) 100vw, 450px"
                        />
                    </div>
                </div>
                <p className="gold-text-shiny font-bold text-[25px] text-yellow-500/90 mt-[18px] italic ">
                    {t.title}
                </p>
            </div>

            {/* 2. BOOKS CONTAINER */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-24 mt-[-60px] mb-[20px] w-full">

                {/* === BOOK 1: STANDARD === */}
                <div
                    onClick={() => onSelect('standard')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-left-8 delay-150 fill-mode-forwards relative`}
                >
                    <div className={`${styles.bookCover} ${styles.perspective1000} relative`}>
                        <div className={`${styles.bgCover} relative overflow-hidden`}>
                            <Image
                                src="/assets/logos/menu-standard.webp"
                                alt="Standard Menu Book"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                                priority
                            />
                        </div>

                        {/* ✅ VÙNG GIẤY VIẾT (STANDARD) */}
                        {/* left-[17%]: Bắt đầu từ sau gáy lò xo */}
                        {/* w-[78%]: Chiều rộng còn lại của trang giấy */}
                        {/* top-[26%]: Bắt đầu từ dưới cái hoa văn trang trí */}
                        {/* flex items-center justify-center: Căn chữ vào GIỮA VÙNG GIẤY NÀY */}
                        <div className="absolute left-[14%] top-[26%] w-[78%] h-[55%] z-20 flex flex-col items-center justify-center text-center">

                            <h3 className="font-bold -luxury text-[25px] md:text-5xl text-[#4a3800] drop-shadow-sm leading-tight mb-2 w-full">
                                {t.std}
                            </h3>

                            <p className="font-bold-body text-[13px] text-[#5c4000] font-semibold w-full px-2">
                                {t.std_desc}
                            </p>

                            <div className="mt-2 w-20 bg-[#000000] opacity-50 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* === BOOK 2: PREMIUM === */}
                <div
                    onClick={() => onSelect('vip')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-right-8 delay-300 fill-mode-forwards relative`}
                >
                    <div className={`${styles.bookCover} ${styles.perspective1000} relative`}>
                        <div className={`${styles.bgCover} relative overflow-hidden`}>
                            <Image
                                src="/assets/logos/menu-premium.webp"
                                alt="Premium Menu Book"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                                priority
                            />
                        </div>
                        <div className={styles.shineEffect} />

                        {/* ✅ VÙNG GIẤY VIẾT (PREMIUM) */}
                        {/* left-[17%]: Giống bên trên, né gáy lò xo */}
                        {/* top-[34%]: Hạ thấp hơn vì Logo Vương Miện to hơn */}
                        <div className="absolute left-[14%] top-[34%] w-[78%] h-[50%] z-20 flex flex-col items-center justify-center text-center">

                            <h3 className="gold-text-shiny font-bold text-[25px] uppercase tracking-wider group-hover:brightness-125">
                                {t.vip}
                            </h3>

                            <p className="gold-text-shiny font-bold text-[10px] uppercase tracking-wider group-hover:brightness-125">
                                {t.vip_desc}
                            </p>

                            <div className="mt-3 w-12 bg-yellow-500 opacity-60 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. NÚT BACK */}
            {onBack && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-8 delay-500 fill-mode-forwards z-30 pb-12">
                    <button
                        onClick={onBack}
                        className="mt-4 w-fit mx-auto rounded-[1.5rem] bg-[linear-gradient(135deg,#B38728_0%,#FBF5B7_50%,#AA8C2C_100%)] flex items-center justify-center gap-1 text-black hover:text-white text-xs uppercase tracking-widest transition-colors py-2"
                    >
                        <ArrowLeft
                            size={20}
                            className="bg-black-500/80 group-hover:bg-white transition-transform duration-300 group-hover:-translate-x-1"
                        />
                        <span className="text-sm text-black/90 group-hover:text-white uppercase tracking-[0.25em] font-semibold transition-colors duration-300">
                            {t.btn_back}
                        </span>
                    </button>
                </div>
            )}

        </div>
    );
};