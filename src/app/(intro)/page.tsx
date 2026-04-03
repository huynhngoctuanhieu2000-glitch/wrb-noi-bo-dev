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
    marginTop: "50px", // Chỉnh lại một chút cho cân đối
    width: "250px",    // Giảm từ 280px xuống 250px
  },

  // 2. VÒNG TRÒN CỜ (ORBIT)
  orbit: {
    marginTop: "50px",  // Hạ thấp khối cờ xuống để không đè lên logo
    centerLogoSize: "100px",
    radius: 130,              // Tăng bán kính để chứa circle lớn hơn
  },

  // 3. CẤU HÌNH LÁ CỜ
  flag: {
    circleSize: 70,           // Kích thước vòng tròn cờ (px) — nhỏ hơn
    flagSize: "55px",         // Cỡ ảnh cờ bên trong circle
    textSize: "13px",         // Cỡ chữ tên ngôn ngữ — to hơn
  },

  // 4. CHỮ CHẠY (MARQUEE)
  marquee: {
    marginBottom: "80px",
    height: "100px",
    fontSize: "17px",
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
  } = useLanguageSelectorLogic(LAYOUT_CONFIG.orbit.radius); // Truyền bán kính từ config vào logic

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


        {!showGreeting && languages.map((lang, index) => {
          const { x, y } = getFlagPosition(index);
          const cs = LAYOUT_CONFIG.flag.circleSize;
          return (
            <div
              key={lang.id}
              className="absolute top-1/2 left-1/2 z-30 cursor-pointer flex flex-col items-center"
              style={{
                width: `${cs}px`,
                marginLeft: `${-cs / 2}px`,
                marginTop: `${-cs / 2 - 10}px`,
                transform: `translate3d(${x}px, ${y}px, 0)`,
              }}
              onClick={() => handleSelectLanguage(lang.id)}
            >
              {/* Circle — cờ lấp đầy vòng tròn, giống mẫu Image 1 */}
              <div
                className="rounded-full overflow-hidden flex items-center justify-center hover:scale-110 hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] transition-all duration-300 shadow-[0_0_12px_rgba(0,0,0,0.4)]"
                style={{
                  width: `${cs}px`,
                  height: `${cs}px`,
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
              >
                <img
                  src={lang.flag}
                  className="w-full h-full object-cover select-none"
                  alt={lang.name}
                  draggable={false}
                />
              </div>
              {/* Tên ngôn ngữ canh giữa dưới circle */}
              <span
                className="font-bold text-center leading-tight drop-shadow-sm mt-1.5 gold-text-soft"
                style={{ fontSize: LAYOUT_CONFIG.flag.textSize }}
              >
                {lang.name}
              </span>
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