/*
 * File: (intro)/page.tsx
 * Chức năng: Trang chủ (/) - Chọn ngôn ngữ
 * Hiển thị giao diện chọn ngôn ngữ với hiệu ứng sao và cờ quốc kỳ
 * Sau khi chọn ngôn ngữ, chuyển đến trang chọn dịch vụ
 */

"use client";

import React from "react";
import { useLanguageSelectorLogic } from "./LanguageSelector.logic";
import { languages } from "./LanguageSelector.lang";
import { animClasses } from "./animation";

// ============================================================================
// 👇 KHU VỰC CHỈNH SỬA GIAO DIỆN CHỌN NGÔN NGỮ (SỬA SỐ Ở ĐÂY) 👇
// ============================================================================
const LAYOUT_CONFIG = {
  // 1. LOGO TRÊN CÙNG
  topLogo: {
    marginTop: "40px",       // Khoảng cách từ mép trên xuống Logo
    width: "200px",          // Chiều rộng Logo
  },

  // 2. VÒNG TRÒN CỜ (ORBIT)
  orbit: {
    marginTop: "0px",        // Đẩy toàn bộ vòng tròn cờ lên (số âm) hoặc xuống (số dương)
    centerLogoSize: "100px", // Kích thước Logo ở giữa vòng tròn
  },

  // 3. CHỮ CHẠY (MARQUEE)
  marquee: {
    marginBottom: "150px",   // Khoảng cách từ mép dưới lên dòng chữ chạy
    height: "100px",         // Chiều cao vùng chứa chữ chạy
    fontSize: "17px",        // Cỡ chữ
  }
};
// ============================================================================

/**
 * Component chính cho trang chọn ngôn ngữ
 * Sử dụng hook useLanguageSelectorLogic để quản lý logic
 */
export default function LanguageSelectorPage() {
  const {
    greeting,
    showGreeting,
    handleSelectLanguage,
    getFlagPosition
  } = useLanguageSelectorLogic();

  // Tạo mảng nội dung lặp lại để chạy chữ (4 lần để đảm bảo lấp đầy màn hình rộng)
  const marqueeContent = Array(4).fill("11 Ngo Duc Ke, Sai Gon Ward, HCMC, VietNam");

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center px-6 relative overflow-hidden bg-black">

      {/* --- NỀN --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/0 z-0" />
        <img
          src="/assets/backgrounds/galaxy.webp"
          alt="Spa Background"
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src="/assets/backgrounds/galaxy.webp" alt="Background" className="bg-image" />
        <div className="shooting-star star-1"></div>
        <div className="shooting-star star-2"></div>
        <div className="shooting-star star-3"></div>

      </div>

      {/* LOGO TRÊN CÙNG */}
      <div
        className={animClasses.logoTopContainer}
        style={{ top: `calc(${LAYOUT_CONFIG.topLogo.marginTop} + env(safe-area-inset-top))` }}
      >
        <img
          src="/assets/logos/logo-gold.webp"
          alt="Ngan Ha Spa"
          className={animClasses.logoTop}
          style={{ width: LAYOUT_CONFIG.topLogo.width }}
        />
      </div>

      {/* VÒNG TRÒN CỜ & LOGO GIỮA */}
      <div
        className={animClasses.orbitContainer}
        style={{ marginTop: LAYOUT_CONFIG.orbit.marginTop }}
      >
        <div
          className={animClasses.centerLogoWrapper(showGreeting)}
          style={{ width: LAYOUT_CONFIG.orbit.centerLogoSize, height: LAYOUT_CONFIG.orbit.centerLogoSize }}
        >
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
          <img
            src="/assets/logos/logo-only-gold.webp"
            alt="Logo Center"
            className="w-[100%] h-[100%] object-contain rounded-full relative z-20 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]"
          />
        </div>

        {!showGreeting && languages.map((lang, index) => {
          const { x, y } = getFlagPosition(index);
          return (
            <div
              key={lang.id}
              className={animClasses.flagItem}
              style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
              onClick={() => handleSelectLanguage(lang.id)}
            >
              <div className={animClasses.flagInner}>
                <img
                  src={lang.flag}
                  className="w-full h-full object-cover aspect-square opacity-90 group-hover:opacity-100"
                  alt={lang.name}
                />
              </div>
            </div>
          );
        })}

        <div className={animClasses.greeting(showGreeting)}>
          {greeting}
        </div>
      </div>

      {/* --- PHẦN CHỮ CHẠY (MARQUEE) --- */}
      <div
        className={animClasses.marqueeWrapper}
        style={{
          bottom: `calc(${LAYOUT_CONFIG.marquee.marginBottom} + env(safe-area-inset-bottom))`,
          height: LAYOUT_CONFIG.marquee.height
        }}
      >
        <div className={`${animClasses.marqueeTrack} animate-scroll`}>
          {marqueeContent.map((text, i) => (
            <div
              key={i}
              className={animClasses.marqueeText}
              style={{ fontSize: LAYOUT_CONFIG.marquee.fontSize }}
            >
              11 Ngo Duc Ke, Sai Gon Ward, HCMC, VietNam
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}