/* File: src/app/[lang]/customer-type/page.tsx */
"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, ArrowRight, X, Loader2, ArrowLeft } from "lucide-react";
import { useCustomerTypeLogic } from "./CustomerType.logic";

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
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center px-6 relative overflow-hidden bg-black">

      {/* --- NỀN VÀ LOGO --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000"
          alt="Spa Background"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className={`z-10 w-full max-w-md flex flex-col gap-4 ${getCommonAnimationClass()}`}>

        {/* --- LOGO --- */}
        <div className="w-24 h-24 mx-auto mb-2 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://i.ibb.co/pq0rH1k/logo-Ngan-ha.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
        </div>

        {/* --- TIÊU ĐỀ (Dùng t() để dịch) --- */}
        <div className="text-center mb-6">
          <h1 className="text-[#EAB308] text-3xl font-bold uppercase tracking-widest mb-2 font-luxury">
            {t('wc_title')}
          </h1>
          <p className="text-gray-400 text-sm">
            {t('wc_desc')}
          </p>
        </div>

        {/* --- NÚT KHÁCH HÀNG CŨ --- */}
        <button
          onClick={onSelectOldUser}
          className="w-full h-[80px] bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-lg rounded-t-2xl flex items-center justify-between px-8 transition-all active:scale-95 shadow-lg"
        >
          <span className="uppercase tracking-wide">{t('btn_old_title')}</span>
          <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center">
            <UserCheck size={24} />
          </div>
        </button>

        {/* --- NÚT KHÁCH HÀNG MỚI --- */}
        <button
          onClick={onSelectNewUser}
          className="group w-full h-[72px] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 rounded-b-2xl flex items-center justify-between px-6 transition-all duration-300 active:scale-95"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-white/90 font-bold text-[15px] uppercase tracking-wide group-hover:text-white">
              {t('btn_new_title')}
            </span>
            <span className="text-gray-400 text-[11px] font-normal mt-0.5 group-hover:text-gray-300 italic">
              {t('btn_new_desc')}
            </span>
          </div>
          <ArrowRight size={20} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
        </button>

        {/* --- NÚT QUAY LẠI --- */}
        <button
          onClick={handleBack}
          className="mt-6 flex items-center justify-center gap-2 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors py-2"
        >
          <ArrowLeft size={14} />
          {t('btn_back')}
        </button>

      </div>

      {/* --- POPUP --- */}
      {/* Áp dụng class animation từ Logic */}
      <div className={getPopupOverlayClass(showPopup)}>
        <div className={getPopupContentClass(showPopup)}>

          <button onClick={closePopup} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>

          {popupStep === 'input' ? (
            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-xl font-bold text-[#EAB308] uppercase tracking-wide">
                {/* Bạn có thể thêm key dịch cho popup title nếu muốn */}
                CHECK MEMBERSHIP
              </h3>
              <p className="text-sm text-gray-300 mb-2">Nhập Email để kiểm tra thành viên.</p>

              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-gray-600 rounded-xl p-3 text-white text-center font-medium focus:border-yellow-500 outline-none transition-colors placeholder-gray-600"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckUserEmail(inputEmail)}
                />
              </div>

              <button
                onClick={() => handleCheckUserEmail(inputEmail)}
                disabled={isLoading}
                className="w-full bg-[#EAB308] hover:bg-[#d9a507] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-md active:scale-95 transition-transform"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "KIỂM TRA NGAY"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-center animate-in zoom-in duration-300">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-1">
                <X size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Chưa tìm thấy!</h3>
                <p className="text-xs text-gray-400 mt-1">Email này chưa từng sử dụng dịch vụ.</p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button onClick={handleRetry} className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium py-3 rounded-xl border border-white/5">
                  Thử lại email khác
                </button>
                <button onClick={onSelectNewUser} className="w-full bg-[#EAB308] hover:bg-[#d9a507] text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wide shadow-md">
                  Đăng ký khách mới
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}