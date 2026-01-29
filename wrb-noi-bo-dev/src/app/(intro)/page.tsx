/*
 * File: (intro)/page.tsx
 * Chức năng: Trang chủ (/) - Chọn ngôn ngữ
 * Hiển thị giao diện chọn ngôn ngữ với hiệu ứng sao và cờ quốc kỳ
 * Sau khi chọn ngôn ngữ, chuyển đến trang chọn dịch vụ
 */

"use client";

import React from "react";
import { useLanguageSelectorLogic } from "./LanguageSelector.logic";
import { languages, staticText } from "./LanguageSelector.lang";
import { animClasses } from "./animation";

/**
 * Component chính cho trang chọn ngôn ngữ
 * Sử dụng hook useLanguageSelectorLogic để quản lý logic
 */
export default function LanguageSelectorPage() {
  const {
    canvasRef,
    greeting,
    showGreeting,
    handleSelectLanguage,
    getFlagPosition
  } = useLanguageSelectorLogic();

  return (
    <div id="screen-galaxy" suppressHydrationWarning className={animClasses.wrapper}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-black/90 z-10 pointer-events-none"></div>
      <img
        src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop"
        className={animClasses.bgImage}
        alt="Background"
        style={{ maxWidth: 'none' }}
      />
      <div className={animClasses.logoTopContainer}>
        <img src="https://i.ibb.co/Y4XK7P4S/spa11.png" alt="Ngan Ha Spa" className={animClasses.logoTop} />
      </div>

      <div className={animClasses.orbitContainer}>
        <div className={animClasses.centerLogoWrapper(showGreeting)}>
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
            <img
              src="https://i.ibb.co/pq0rH1k/logo-Ngan-ha.png"
              alt="Logo Center"
              className="w-[70%] h-[70%] object-contain rounded-full relative z-20 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]"
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

      <div className={animClasses.footer}>
        {staticText.footer}
      </div>

    </div>
  );
}