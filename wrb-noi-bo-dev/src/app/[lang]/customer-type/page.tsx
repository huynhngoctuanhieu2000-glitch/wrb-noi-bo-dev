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

      <div className={`z-10 w-full max-w-md flex flex-col gap-4 ${getCommonAnimationClass()}`}>

        {/* --- LOGO --- */}
        <div className="w-48 h-48 mx-auto mb-2 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
          <img src="https://i.postimg.cc/4xDZ4cxg/only-logo-500x500px-(maltic-gold).png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
        </div>

        {/* --- TIÊU ĐỀ (Dùng t() để dịch) --- */}
        <div className="text-center mb-6">
          <h1 className="text-[30px] font-bold uppercase tracking-[0.1em] mb-2 font-bold luxury gold-text-shiny drop-shadow-md">
            {t('wc_title')}
          </h1>
          <p className="gold-text-soft text-[20px] font-medium tracking-wide opacity-100">
            {t('wc_desc')}
          </p>
        </div>

        {/* --- NÚT KHÁCH HÀNG CŨ --- */}
        <button
          onClick={onSelectOldUser}
          className="w-full h-[80px] bg-[linear-gradient(135deg,#B38728_0%,#FBF5B7_50%,#AA8C2C_100%)] hover:brightness-110 text-black font-extrabous font-bold text-[15px] rounded-[1.5rem] flex items-center justify-between px-8 transition-all active:scale-[0.98] shadow-[0_10px_20px_-10px_rgba(179,135,40,0.5)]"
        >
          <span className="uppercase tracking-widest">{t('btn_old_title')}</span>
          <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserCheck size={22} />
          </div>
        </button>
        {/* --- NÚT KHÁCH HÀNG MỚI --- */}
        <button
          onClick={onSelectNewUser}
          className="group w-full h-[75px] bg-[black]/[0.03] border-yellow hover:bg-yellow-500/10 rounded-[1.5rem] flex items-center justify-between px-6 transition-all duration-300 active:scale-[0.98]"
        >
          <div className="flex flex-col items-start text-left">
            <span className="gold-text-shiny font-bold text-[15px] uppercase tracking-wider group-hover:brightness-125">
              {t('btn_new_title')}
            </span>
            <span className="text-gray-500 text-[10px] font-normal tracking-tight group-hover:text-gray-400 italic">
              {t('btn_new_desc')}
            </span>
          </div>
          <ArrowRight size={30} className="text-yellow-600/50 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
        </button>
        {/* --- NÚT QUAY LẠI --- */}
        <button
          onClick={handleBack}
          className="mt-4 w-fit mx-auto rounded-[1.5rem] bg-[linear-gradient(135deg,#B38728_0%,#FBF5B7_50%,#AA8C2C_100%)] flex items-center justify-center gap-1 text-black hover:text-white text-xs uppercase tracking-widest transition-colors py-2"
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
              <h3 className="text-xl font-bold gold-text-shiny uppercase tracking-widest">
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
                className="w-full bg-[linear-gradient(125deg,#8B6E40_0%,#FBF5B7_30%,#B38728_50%,#FFF8D6_70%,#8B6E40_100%)] hover:brightness-110 text-[#422006] font-bold text-[14px] rounded-xl items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform"
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