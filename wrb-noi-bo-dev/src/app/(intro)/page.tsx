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
          src="https://i.postimg.cc/K8mxt9QM/galaxy2.png"
          alt="Spa Background"
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src="https://i.postimg.cc/K8mxt9QM/galaxy2.png" alt="Background" className="bg-image" />
        <div className="shooting-star star-1"></div>
        <div className="shooting-star star-2"></div>
        <div className="shooting-star star-3"></div>

      </div>

      <div className={animClasses.logoTopContainer}>
        <img src="https://i.postimg.cc/3J8zBRVz/logo-500x500px-(maltic-gold)-1.png" alt="Ngan Ha Spa" className={animClasses.logoTop} />
      </div>

      <div className={animClasses.orbitContainer}>
        <div className={animClasses.centerLogoWrapper(showGreeting)}>
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
          <img
            src="https://i.postimg.cc/4xDZ4cxg/only-logo-500x500px-(maltic-gold).png"
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
      <div className={animClasses.marqueeWrapper}>
        <div className={`${animClasses.marqueeTrack} animate-scroll`}>
          {marqueeContent.map((text, i) => (
            <div key={i} className={animClasses.marqueeText}> 11 Ngo Duc Ke, Sai Gon Ward, HCMC, VietNam </div>
          ))}
        </div>
      </div>

    </div>
  );
}