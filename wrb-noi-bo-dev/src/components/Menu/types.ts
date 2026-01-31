/*
 * File: Menu/types.ts
 * Chức năng: Định nghĩa toàn bộ cấu trúc dữ liệu (TypeScript Interfaces) cho hệ thống Menu.
 * Logic chi tiết:
 * - MultiLangString: Hỗ trợ đa ngôn ngữ cho tên và mô tả.
 * - Service: Cấu trúc dữ liệu của một dịch vụ (ID, giá, thời gian, hình ảnh...).
 * - CartState: Cấu trúc lưu trữ giỏ hàng (ID -> Số lượng).
 * - SheetState: Quản lý trạng thái đóng/mở của các bảng chọn (Main, Review, Cart).
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */

// 1. Đa ngôn ngữ (Quan trọng để hiển thị tên món theo En/Vi/Cn...)
export interface MultiLangString {
  en: string;
  vn: string;
  cn?: string;
  jp?: string;
  kr?: string;
  [key: string]: string | undefined;
}

// 2. Dữ liệu Dịch vụ (Service) chuẩn hóa
export interface Service {
  id: string;          // VD: "NHS001"
  cat: string;         // VD: "Body" - ID danh mục

  // Thông tin hiển thị
  names: MultiLangString;
  descriptions: MultiLangString;
  img: string;

  // Giá và Thời gian
  priceVND: number;
  priceUSD: number;
  timeValue: number;   // 60 (dùng để tính toán)
  timeDisplay?: string; // "60 mins" (dùng để hiển thị)

  // Logic phân loại
  menuType?: 'standard' | 'vip';
  tags?: MultiLangString[];
}

// 3. Dữ liệu Danh mục (Category)
export interface Category {
  id: string;
  names: MultiLangString;
  image?: string;
}

// 4. Giỏ hàng (Lưu ID và Số lượng)
export type CartState = Record<string, number>;

// 5. QUẢN LÝ TRẠNG THÁI SHEET (Bảng trượt) - MỚI
// Đây là phần quan trọng để điều khiển MainSheet và ReviewSheet
export type SheetType = 'MAIN' | 'REVIEW' | 'CART' | null;

export interface SheetState {
  isOpen: boolean;
  type: SheetType;
  // Cho phép data chứa: 1 món (Service) HOẶC 1 nhóm món (Service[]) HOẶC null
  data: Service | Service[] | null | any;
}

// 6. Các type phụ trợ cũ của bạn (Giữ lại để tương thích nếu cần)
export type SupportedLanguage = 'vi' | 'en' | 'jp' | 'kr' | 'cn';