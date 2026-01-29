/*
 * File: src/app/[lang]/customer-type/CustomerType.logic.ts
 * Chức năng: Logic xử lý chọn khách hàng, Popup check mail & Animation
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { translations, TranslationKey } from "./CustomerType.i18n";
// ✅ Import hàm check từ Service theo chuẩn Barrel File
import { checkUserEmail } from "@/services/user";

export const useCustomerTypeLogic = (lang: string) => {
  const router = useRouter();

  // --- 1. CÁC STATE QUẢN LÝ ---
  const [isExiting, setIsExiting] = useState(false); // Animation chuyển trang
  const [showPopup, setShowPopup] = useState(false); // Bật/Tắt Popup
  const [popupStep, setPopupStep] = useState<'input' | 'error'>('input'); // Bước của popup
  const [isLoading, setIsLoading] = useState(false); // Loading khi gọi Firebase

  // --- 2. HÀM DỊCH NGÔN NGỮ (Giữ nguyên) ---
  const t = (key: TranslationKey) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    return key;
  };

  // --- 3. LOGIC XỬ LÝ KHÁCH HÀNG MỚI ---
  // Gọi khi bấm nút "Khách hàng mới" hoặc chọn "Đăng ký mới" từ Popup lỗi
  const onSelectNewUser = () => {
    setShowPopup(false); // Tắt popup nếu đang mở
    setIsExiting(true);  // Kích hoạt animation bay lên

    // Đợi 500ms cho animation chạy xong rồi mới chuyển trang
    setTimeout(() => {
      // ✅ Sửa đường dẫn chuẩn theo cấu trúc mới: .../new-user/select-menu
      router.push(`/${lang}/new-user/select-menu`);
    }, 500);
  };

  // --- 4. LOGIC XỬ LÝ KHÁCH HÀNG CŨ ---
  // Gọi khi bấm nút "Khách hàng cũ" -> Chỉ mở Popup, chưa chuyển trang
  const onSelectOldUser = () => {
    setPopupStep('input'); // Reset về màn hình nhập
    setShowPopup(true);    // Hiện Popup
  };

  // --- 5. LOGIC CHECK EMAIL VỚI FIREBASE (QUAN TRỌNG) ---
  const handleCheckUserEmail = async (email: string) => {
    if (!email.trim()) return; // Không làm gì nếu ô trống

    setIsLoading(true);

    // 🔥 Gọi Service (File checkUserEmail.ts thông qua index.ts)
    const exists = await checkUserEmail(email);

    setIsLoading(false);

    if (exists) {
      // ✅ TÌM THẤY: Lưu email tạm và chuyển sang lịch sử
      // (Có thể lưu vào localStorage hoặc Redux/Context tùy bạn)
      localStorage.setItem('currentUserEmail', email);

      setIsExiting(true); // Animation thoát
      setTimeout(() => {
        router.push(`/${lang}/old-user/history`);
      }, 500);
    } else {
      // ❌ KHÔNG THẤY: Chuyển popup sang giao diện báo lỗi
      setPopupStep('error');
    }
  };

  // --- 6. CÁC HÀM PHỤ TRỢ ---
  const handleRetry = () => setPopupStep('input'); // Quay lại nhập lại
  const closePopup = () => setShowPopup(false);    // Đóng popup

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.push('/'), 500);
  };

  const getCommonAnimationClass = () =>
    `transition-all duration-700 ease-out transform ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`;

  // --- 7. TRẢ VỀ ---
  return {
    // State
    isExiting,
    showPopup,
    popupStep,
    isLoading,

    // Functions
    t,
    onSelectNewUser,      // Dùng cho nút Khách Mới
    onSelectOldUser,      // Dùng cho nút Khách Cũ
    handleCheckUserEmail, // Dùng cho nút "Kiểm tra" trong Popup
    handleRetry,          // Dùng cho nút "Nhập lại"
    closePopup,
    handleBack,
    getCommonAnimationClass
  };
};