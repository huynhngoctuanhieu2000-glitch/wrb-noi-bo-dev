/*
 * File: layout.tsx
 * Chức năng: Layout gốc của ứng dụng Next.js
 * Định nghĩa metadata cho trang web và cấu trúc HTML cơ bản
 * Bao gồm import CSS toàn cục và render children (các trang con)
 */

import type { Metadata } from "next";
import "./globals.css"; // 👈 QUAN TRỌNG: Dòng này để tải file CSS nền đen, font chữ...
import { MenuProvider } from "@/components/Menu/MenuContext";

import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ngan Ha Spa",
  description: "Booking System for Ngan Ha Spa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Thẻ body này là nơi chứa mọi trang web của bạn.
        Nó sẽ tự động nhận các style từ globals.css
      */}
      <body className={`${beVietnamPro.className} antialiased w-full h-full`}>
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}