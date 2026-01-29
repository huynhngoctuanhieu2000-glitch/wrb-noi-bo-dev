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
  // Kiểm tra nếu khách chưa chọn ngôn ngữ thì đá về trang chủ
  const { pathname } = request.nextUrl;

  // Nếu không phải trang intro và không có lang, redirect về /
  if (!pathname.startsWith('/(intro)') && !pathname.match(/^\/(vi|en|jp)/)) {
    return NextResponse.redirect(new URL('/', request.url));
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