/*
 * File: LanguageSelector.lang.ts
 * Chức năng: Định nghĩa dữ liệu ngôn ngữ và text tĩnh
 * Chứa danh sách các ngôn ngữ hỗ trợ với thông tin cờ và greeting
 * Cung cấp text footer chung cho tất cả ngôn ngữ
 */

/**
 * Interface định nghĩa cấu trúc của một ngôn ngữ
 */
export interface Language {
  id: string; // Mã ngôn ngữ (vi, en, jp, etc.)
  name: string; // Tên đầy đủ của ngôn ngữ
  greeting: string; // Text chào mừng khi chọn ngôn ngữ
  flag: string; // URL hình ảnh cờ quốc gia
}

/**
 * Mảng chứa tất cả ngôn ngữ được hỗ trợ
 * Mỗi ngôn ngữ có thông tin cờ và greeting riêng
 */
export const languages: Language[] = [
  {
    id: "en",
    name: "English",
    greeting: "Welcome to Ngan Ha",
    flag: "https://flagcdn.com/w80/gb.png"
  },
  {
    id: "vn",
    name: "Tiếng Việt",
    greeting: "Ngân Hà Xin Chào",
    flag: "https://flagcdn.com/w80/vn.png"
  },
  {
    id: "jp",
    name: "Japanese",
    greeting: "Ngan Ha ようこそ",
    flag: "https://flagcdn.com/w80/jp.png"
  },
  {
    id: "kr",
    name: "Korean",
    greeting: "Ngan Ha 의 인사",
    flag: "https://flagcdn.com/w80/kr.png"
  },
  {
    id: "cn",
    name: "Chinese",
    greeting: "Ngan Ha 向您问候",
    flag: "https://flagcdn.com/w80/cn.png"
  }
];

/**
 * Text tĩnh không phụ thuộc vào ngôn ngữ
 * Hiện tại chỉ có footer với địa chỉ spa
 */
export const staticText = {
  footer: "Ngan Ha: 11 Ngo Duc Ke St, Sai Gon Ward, Ho Chi Minh City"
};