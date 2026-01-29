/* File: src/app/[lang]/customer-type/page.tsx */
"use client";

import React, { useState } from "react";
import { UserCheck, ArrowRight, X, Loader2 } from "lucide-react"; // Đảm bảo đã cài lucide-react
import { useCustomerTypeLogic } from "./CustomerType.logic";

export default function CustomerTypePage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = React.useState<string>("en");
  const [inputEmail, setInputEmail] = useState("");

  React.useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  // Lấy các hàm MỚI từ file Logic
  const {
    showPopup,
    popupStep,
    isLoading,
    onSelectOldUser,      // <-- Tên mới
    onSelectNewUser,      // <-- Tên mới
    handleCheckUserEmail, // <-- Tên mới
    handleRetry,
    closePopup,
    getCommonAnimationClass
  } = useCustomerTypeLogic(lang);

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center px-6 relative overflow-hidden bg-black">

      {/* --- NỀN VÀ LOGO (Giữ nguyên phần trang trí của bạn) --- */}

      <div className={`z-10 w-full max-w-md flex flex-col gap-4 ${getCommonAnimationClass()}`}>

        {/* TIÊU ĐỀ */}
        <div className="text-center mb-6">
          <h1 className="text-[#EAB308] text-3xl font-bold uppercase tracking-widest mb-2">CHÀO MỪNG</h1>
          <p className="text-gray-400 text-sm">Bạn là khách hàng mới hay đã từng đến?</p>
        </div>

        {/* --- NÚT KHÁCH HÀNG CŨ --- */}
        <button
          onClick={onSelectOldUser} // ✅ SỬA: Gọi hàm onSelectOldUser
          className="w-full h-[80px] bg-[#EAB308] hover:bg-[#ca9a06] text-black font-bold text-lg rounded-t-2xl flex items-center justify-between px-8 transition-all active:scale-95"
        >
          <span>KHÁCH HÀNG CŨ</span>
          <UserCheck size={28} />
        </button>

        {/* --- NÚT KHÁCH HÀNG MỚI --- */}
        <button
          onClick={onSelectNewUser} // ✅ SỬA: Gọi hàm onSelectNewUser
          className="group w-full h-[72px] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 rounded-b-2xl flex items-center justify-between px-6 transition-all duration-300 active:scale-95"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-white/90 font-bold text-[15px] uppercase tracking-wide group-hover:text-white">
              Khách hàng mới
            </span>
            <span className="text-gray-400 text-[11px] font-normal mt-0.5 group-hover:text-gray-300">
              Lần đầu đến
            </span>
          </div>
          <ArrowRight size={20} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* --- POPUP CHECK EMAIL (Phần này giữ nguyên logic hiển thị) --- */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-yellow-500/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">

            <button onClick={closePopup} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>

            {popupStep === 'input' ? (
              // Màn hình nhập
              <div className="flex flex-col gap-4 text-center">
                <h3 className="text-xl font-bold text-[#EAB308]">TRA CỨU ĐƠN HÀNG</h3>
                <p className="text-sm text-gray-300">Nhập Email để xem lịch sử.</p>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckUserEmail(inputEmail)}
                />
                <button
                  onClick={() => handleCheckUserEmail(inputEmail)}
                  disabled={isLoading}
                  className="w-full bg-[#EAB308] hover:bg-[#ca9a06] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "TRA CỨU"}
                </button>
              </div>
            ) : (
              // Màn hình lỗi
              <div className="flex flex-col gap-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-2">
                  <X size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Không tìm thấy!</h3>
                <p className="text-sm text-gray-400">Email chưa từng đặt lịch.</p>
                <button onClick={handleRetry} className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg">
                  Thử lại
                </button>
                <button onClick={onSelectNewUser} className="w-full bg-[#EAB308] text-black font-bold py-3 rounded-lg">
                  Đăng ký mới
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}