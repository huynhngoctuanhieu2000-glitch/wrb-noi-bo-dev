/* File: src/app/[lang]/customer-type/page.tsx */
"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, ArrowRight, X, Loader2, ArrowLeft, History, Search } from "lucide-react";
import { useCustomerTypeLogic } from "./CustomerType.logic";

// ============================================================================
// 👇 KHU VỰC CHỈNH SỬA GIAO DIỆN (SỬA SỐ Ở ĐÂY) 👇
// ============================================================================
const LAYOUT_CONFIG = {
  // 1. CẤU HÌNH LOGO
  logo: {
    size: "180px",           // Kích thước Logo (Vuông)
    marginBottom: "20px",    // Khoảng cách từ Logo xuống Tiêu đề
  },

  // 2. CẤU HÌNH TIÊU ĐỀ
  text: {
    titleSize: "28px",       // Cỡ chữ tiêu đề chính (WELCOME...)
    descSize: "16px",        // Cỡ chữ mô tả bên dưới
    marginBottom: "30px",    // Khoảng cách từ chữ xuống nút đầu tiên
  },

  // 3. CẤU HÌNH NÚT BẤM (BUTTONS)
  buttons: {
    height: "70px",          // Chiều cao của 2 nút chính
    gap: "16px",             // Khoảng cách giữa 2 nút
    fontSizeTitle: "16px",   // Cỡ chữ tiêu đề trong nút
    fontSizeDesc: "11px",    // Cỡ chữ mô tả (nhỏ) trong nút KH mới
    iconSize: 22,            // Kích thước Icon (số, không phải px)
  },

  // 4. CẤU HÌNH NÚT BACK
  backButton: {
    marginTop: "20px",       // Khoảng cách từ nút KH mới xuống nút Back
    fontSize: "14px",        // Cỡ chữ
    paddingX: "30px",        // Độ rộng nút
    paddingY: "10px",        // Độ dày nút
  }
};
// ============================================================================

export default function CustomerTypePage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState<string>("en");
  const [inputEmail, setInputEmail] = useState("");

  useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  const {
    t,                    // <-- Lấy hàm dịch
    showPopup,
    popupStep,
    isLoading,
    onSelectOldUser,
    onSelectNewUser,
    handleCheckUserEmail,
    handleRetry,
    closePopup,
    handleBack,           // <-- Lấy hàm quay lại
    getCommonAnimationClass,
    getPopupOverlayClass, // <-- Lấy animation popup
    getPopupContentClass  // <-- Lấy animation content
  } = useCustomerTypeLogic(lang);

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center px-6 relative overflow-hidden bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

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

      <div className={`z-10 w-full max-w-md flex flex-col ${getCommonAnimationClass()}`} style={{ gap: LAYOUT_CONFIG.buttons.gap }}>

        {/* --- LOGO --- */}
        <div
          className="mx-auto relative flex items-center justify-center"
          style={{
            width: LAYOUT_CONFIG.logo.size,
            height: LAYOUT_CONFIG.logo.size,
            marginBottom: LAYOUT_CONFIG.logo.marginBottom
          }}
        >
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
          <img src="/assets/logos/logo-only-gold.webp" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
        </div>

        {/* --- TIÊU ĐỀ (Dùng t() để dịch) --- */}
        <div className="text-center" style={{ marginBottom: LAYOUT_CONFIG.text.marginBottom }}>
          <h1
            className="font-bold uppercase tracking-[0.1em] mb-2 font-bold luxury gold-text-shiny drop-shadow-md"
            style={{ fontSize: LAYOUT_CONFIG.text.titleSize }}
          >
            {t('wc_title')}
          </h1>
          <p
            className="gold-text-soft font-medium tracking-wide opacity-100"
            style={{ fontSize: LAYOUT_CONFIG.text.descSize }}
          >
            {t('wc_desc')}
          </p>
        </div>

        {/* --- NÚT KHÁCH HÀNG CŨ --- */}
        <button
          onClick={onSelectOldUser}
          style={{ height: LAYOUT_CONFIG.buttons.height }}
          className="w-full h-auto py-4 bg-[linear-gradient(135deg,#B38728_0%,#FBF5B7_50%,#AA8C2C_100%)] hover:brightness-110 text-black font-extrabous font-bold rounded-[1.5rem] flex items-center justify-between px-8 transition-all active:scale-[0.98] shadow-[0_10px_20px_-10px_rgba(179,135,40,0.5)]"
        >
          <span className="uppercase tracking-widest" style={{ fontSize: LAYOUT_CONFIG.buttons.fontSizeTitle }}>
            {t('btn_old_title')}
          </span>
          <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserCheck size={LAYOUT_CONFIG.buttons.iconSize} />
          </div>
        </button>

        {/* --- NÚT KHÁCH HÀNG MỚI --- */}
        <button
          onClick={onSelectNewUser}
          style={{ height: LAYOUT_CONFIG.buttons.height }}
          className="group w-full h-auto py-4 bg-[black]/[0.03] border-yellow hover:bg-yellow-500/10 rounded-[1.5rem] flex items-center justify-between px-6 transition-all duration-300 active:scale-[0.98]"
        >
          <div className="flex flex-col items-start text-left">
            <span
              className="gold-text-shiny font-bold uppercase tracking-wider group-hover:brightness-125"
              style={{ fontSize: LAYOUT_CONFIG.buttons.fontSizeTitle }}
            >
              {t('btn_new_title')}
            </span>
            <span
              className="text-gray-500 font-normal tracking-tight group-hover:text-gray-400 italic"
              style={{ fontSize: LAYOUT_CONFIG.buttons.fontSizeDesc }}
            >
              {t('btn_new_desc')}
            </span>
          </div>
          <ArrowRight size={30} className="text-yellow-600/50 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
        </button>

        {/* --- NÚT QUAY LẠI --- */}
        <button
          onClick={handleBack}
          style={{
            marginTop: LAYOUT_CONFIG.backButton.marginTop,
            paddingTop: LAYOUT_CONFIG.backButton.paddingY,
            paddingBottom: LAYOUT_CONFIG.backButton.paddingY,
            paddingLeft: LAYOUT_CONFIG.backButton.paddingX,
            paddingRight: LAYOUT_CONFIG.backButton.paddingX,
            fontSize: LAYOUT_CONFIG.backButton.fontSize
          }}
          className="w-fit mx-auto rounded-[1.5rem] bg-[linear-gradient(135deg,#B38728_0%,#FBF5B7_50%,#AA8C2C_100%)] flex items-center justify-center gap-1 text-black hover:text-white uppercase tracking-widest transition-colors py-2"
        >
          <ArrowLeft size={14} />
          {t('btn_back')}
        </button>

      </div>

      {/* --- POPUP --- */}
      {/* Áp dụng class animation từ Logic */}
      <div className={getPopupOverlayClass(showPopup)}>
        <div className={`${getPopupContentClass(showPopup)} !bg-[#0f1218] !border-[#2a2f3e] !rounded-[32px] !p-8 !max-w-[400px]`}>
          {/* Note: Override styles for dark theme look */}

          {popupStep === 'input' ? (
            <div className="flex flex-col items-center text-center">
              {/* Icon Clock Gold */}
              <div className="mb-6 relative">
                <div className="w-20 h-20 rounded-full border-4 border-[#8B6E40]/30 flex items-center justify-center">
                  <History size={48} className="text-[#D4AF37]" strokeWidth={2.5} />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#D4AF37] blur-3xl opacity-20 rounded-full"></div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {t('find_history')}
              </h3>
              <p className="text-sm text-gray-400 mb-8 font-medium">
                {t('desc_enter_email')}
              </p>

              <div className="w-full space-y-4">
                <input
                  type="email"
                  placeholder={t('input_placeholder')}
                  className="w-full bg-[#161b26] border border-[#2a3040] rounded-2xl p-4 text-white text-center font-bold text-lg focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] outline-none transition-all placeholder-gray-600"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckUserEmail(inputEmail)}
                  autoFocus
                />

                <button
                  onClick={() => handleCheckUserEmail(inputEmail)}
                  disabled={isLoading}
                  className="w-full bg-[#EAB308] hover:bg-[#d9a507] text-black font-extrabold text-[15px] py-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      {t('search')} <Search size={18} strokeWidth={3} />
                    </>
                  )}
                </button>

                <button
                  onClick={closePopup}
                  className="text-gray-500 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-colors mt-2"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-center animate-in zoom-in duration-300">
              {/* Not Found State - Keep somewhat consistent but dark */}
              <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                <X size={40} strokeWidth={3} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">{t('error_not_found')}</h3>
                <p className="text-sm text-gray-400">{t('error_desc')}</p>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button onClick={handleRetry} className="w-full bg-[#2a2f3e] hover:bg-[#353b4d] text-white font-bold py-3.5 rounded-xl border border-white/5 transition-colors">
                  {t('btn_retry')}
                </button>
                <button onClick={onSelectNewUser} className="w-full bg-[#EAB308] hover:bg-[#d9a507] text-black font-bold py-3.5 rounded-xl uppercase tracking-wide shadow-md transition-colors">
                  {t('btn_register_new')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}