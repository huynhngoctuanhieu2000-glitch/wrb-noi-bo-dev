"use client";

import React from "react";
import Image from "next/image";
import styles from "./style.module.css";
import { ArrowLeft } from "lucide-react";

// ============================================================================
// 👇 KHU VỰC CHỈNH SỬA GIAO DIỆN (CHỈ CẦN SỬA SỐ Ở ĐÂY) 👇
// ============================================================================
const LAYOUT_CONFIG = {
    // 1. CẤU HÌNH LOGO & TIÊU ĐỀ
    header: {
        marginTop: "10px",       // Đẩy xuống một chút để không bị cắt Logo
        gapLogoText: "5px",      // Khoảng cách Logo - Chữ gần hơn
        marginBottom: "15px",    // Khoảng cách Chữ - Sách gần hơn
        logoHeight: "80px",      // Giảm chiều cao Logo cho đỡ chiếm chỗ
        logoWidth: "260px",      // Giảm chiều rộng tương ứng
        titleSize: "18px",       // Giảm cỡ chữ tiêu đề 1 chút
    },

    // 2. CẤU HÌNH CUỐN SÁCH MENU
    books: {
        width: "165px",          // Tăng chiều rộng để không bị mất lò xo (giữ tỉ lệ ảnh chuẩn)
        height: "210px",         // Chiều cao giữ nguyên
        gap: "20px",             // Giảm khoảng cách giữa 2 sách
        titleSize: "20px",       // Cỡ chữ tên gói
        descSize: "11px",        // Cỡ chữ mô tả
    },

    // 3. CẤU HÌNH NÚT BACK (QUAY LẠI)
    backButton: {
        marginTop: "15px",       // Khoảng cách từ sách xuống nút
        marginBottom: "15px",    // Cách đáy màn hình
        fontSize: "13px",        // Cỡ chữ nút
        paddingY: "10px",        // Độ dày nút
        paddingX: "30px",        // Độ rộng nút
        minWidth: "30px",       // Chiều dài tối thiểu
    }
};
// ============================================================================

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
        <div className="flex flex-col items-center justify-between h-full w-full max-h-full py-2">

            {/* 1. HEADER */}
            <div
                className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 shrink-0"
                style={{
                    marginTop: LAYOUT_CONFIG.header.marginTop,
                    marginBottom: LAYOUT_CONFIG.header.marginBottom // Áp dụng khoảng cách xuống sách
                }}
            >
                <div
                    className="mx-auto relative animate-pulse z-10"
                    style={{ height: LAYOUT_CONFIG.header.logoHeight, width: LAYOUT_CONFIG.header.logoWidth }}
                >
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
                <p
                    className="gold-text-shiny font-bold text-yellow-500/90 mt-0 italic"
                    style={{
                        fontSize: LAYOUT_CONFIG.header.titleSize,
                        marginTop: LAYOUT_CONFIG.header.gapLogoText // Áp dụng khoảng cách Logo - Text
                    }}
                >
                    {t.title}
                </p>
            </div>

            {/* 2. BOOKS CONTAINER */}
            <div
                className="flex flex-col md:flex-row justify-center items-center w-full flex-1 min-h-0"
                style={{ gap: LAYOUT_CONFIG.books.gap }}
            >

                {/* === BOOK 1: STANDARD === */}
                <div
                    onClick={() => onSelect('standard')}
                    className={`group ${styles.bookWrapper} cursor-pointer active:scale-95 transition-transform duration-300 animate-in fade-in slide-in-from-left-8 delay-150 fill-mode-forwards relative`}
                >
                    <div
                        className={`${styles.bookCover} ${styles.perspective1000} relative`}
                        style={{ width: LAYOUT_CONFIG.books.width, height: LAYOUT_CONFIG.books.height }}
                    >
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

                        {/* TEXT ON STANDARD BOOK */}
                        <div className="absolute left-[14%] top-[26%] w-[78%] h-[55%] z-20 flex flex-col items-center justify-center text-center">
                            <h3
                                className="font-bold -luxury text-[#4a3800] drop-shadow-sm leading-tight mb-1 w-full"
                                style={{ fontSize: LAYOUT_CONFIG.books.titleSize }}
                            >
                                {t.std}
                            </h3>
                            <p
                                className="font-bold-body text-[#5c4000] font-semibold w-full px-1"
                                style={{ fontSize: LAYOUT_CONFIG.books.descSize }}
                            >
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
                    <div
                        className={`${styles.bookCover} ${styles.perspective1000} relative`}
                        style={{ width: LAYOUT_CONFIG.books.width, height: LAYOUT_CONFIG.books.height }}
                    >
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

                        {/* TEXT ON PREMIUM BOOK */}
                        <div className="absolute left-[14%] top-[34%] w-[78%] h-[50%] z-20 flex flex-col items-center justify-center text-center">
                            <h3
                                className="gold-text-shiny font-bold uppercase tracking-wider group-hover:brightness-125 mb-1"
                                style={{ fontSize: LAYOUT_CONFIG.books.titleSize }}
                            >
                                {t.vip}
                            </h3>
                            <p
                                className="gold-text-shiny font-bold uppercase tracking-wider group-hover:brightness-125"
                                style={{ fontSize: LAYOUT_CONFIG.books.descSize }}
                            >
                                {t.vip_desc}
                            </p>
                            <div className="mt-3 w-12 bg-yellow-500 opacity-60 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. NÚT BACK */}
            {onBack && (
                <div
                    className="text-center animate-in fade-in slide-in-from-bottom-8 delay-500 fill-mode-forwards z-30"
                    style={{
                        paddingBottom: LAYOUT_CONFIG.backButton.marginBottom,
                        marginTop: LAYOUT_CONFIG.backButton.marginTop // Áp dụng khoảng cách từ sách xuống nút
                    }}
                >
                    <button
                        onClick={onBack}
                        style={{
                            fontSize: LAYOUT_CONFIG.backButton.fontSize,
                            paddingTop: LAYOUT_CONFIG.backButton.paddingY,
                            paddingBottom: LAYOUT_CONFIG.backButton.paddingY,
                            paddingLeft: LAYOUT_CONFIG.backButton.paddingX,
                            paddingRight: LAYOUT_CONFIG.backButton.paddingX,
                            minWidth: LAYOUT_CONFIG.backButton.minWidth
                        }}
                        className="mt-4 mx-auto rounded-[2rem] bg-[linear-gradient(135deg,#B38728_0%,#FBF5B7_50%,#AA8C2C_100%)] flex items-center justify-center gap-2 text-black hover:text-white uppercase tracking-widest transition-colors shadow-lg"
                    >
                        <ArrowLeft
                            size={20}
                            className="bg-black-500/80 group-hover:bg-white transition-transform duration-300 group-hover:-translate-x-1"
                        />
                        <span className="text-black/90 group-hover:text-white uppercase tracking-[0.25em] font-semibold transition-colors duration-300">
                            {t.btn_back}
                        </span>
                    </button>
                </div>
            )}

        </div>
    );
};