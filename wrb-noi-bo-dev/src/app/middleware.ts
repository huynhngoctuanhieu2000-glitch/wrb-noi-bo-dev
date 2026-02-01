/*
 * File: middleware.ts
 * Chức năng: Middleware của Next.js để kiểm soát routing
 * Kiểm tra nếu người dùng chưa chọn ngôn ngữ, redirect về trang chủ
 * Chỉ cho phép truy cập các trang intro hoặc các trang có ngôn ngữ (vi, en, jp)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Hàm middleware chính
 * @param request - Đối tượng NextRequest chứa thông tin request
 * @returns NextResponse - Redirect hoặc cho phép tiếp tục
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Cho phép các file tĩnh và API đi qua (quan trọng)
  if (
    pathname.includes('.') || // Đuôi file (.png, .css)
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // 2. Danh sách ngôn ngữ hỗ trợ
  // Thêm vn, kr, cn vào đây để khớp với actual usage
  const locales = ['vi', 'vn', 'en', 'jp', 'kr', 'cn'];

  // 3. Kiểm tra xem URL có bắt đầu bằng ngôn ngữ không
  const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));

  if (!hasLocale) {
    // Nếu không có locale -> Redirect về / (Trang chọn ngôn ngữ/Intro)
    // Lưu ý: Chỉ redirect nếu KHÔNG PHẢI là trang chủ gốc '/'
    // Và không phải là các trang đặc biệt khác nếu có
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Cấu hình matcher cho middleware
 * Loại trừ các đường dẫn tĩnh như API, _next, favicon
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};