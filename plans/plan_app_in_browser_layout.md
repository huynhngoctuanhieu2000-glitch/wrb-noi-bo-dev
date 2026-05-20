# Kế hoạch Triển khai: App-in-Browser Layout (Responsive Design)

**Ngày**: 2026-05-19
**Trạng thái**: Chờ duyệt

---

## 1. Mục tiêu (Objective)
Giải quyết triệt để tình trạng UI bị "kéo giãn to đùng" trên Desktop/Tablet ngang bằng cách giới hạn toàn bộ ứng dụng (mobile-first) vào trong một "Khung điện thoại ảo" (App-in-Browser Frame) nằm giữa màn hình. Giao diện Desktop sẽ mang lại cảm giác cao cấp (Premium) với hình nền Spa phía sau khung ứng dụng.

## 2. Các điểm trọng tâm (Key Focus Areas)

### 2.1. Cập nhật `globals.css` (Gỡ trói Body trên Desktop)
Hiện tại `html, body { position: fixed; inset: 0; }` khóa chết trang, ngăn không cho tạo layout tự do trên Desktop. 
**Hành động**:
Thêm media query để trả lại trạng thái bình thường cho body từ màn hình `md` trở lên:
```css
@media (min-width: 768px) {
  html, body {
    position: relative !important;
    height: auto !important;
    min-height: 100vh;
  }
}
```
*Lưu ý: Trên Mobile (`<768px`), giữ nguyên `position: fixed` để không làm hỏng tính năng chống scroll bounce/pull-to-refresh hiện tại.*

### 2.2. Khung "App-in-Browser" (The Wrapper)
Tạo mới một Client Component `AppFrameWrapper` tại `src/components/Shared/AppFrameWrapper.tsx`.
Sau đó, import và bọc quanh `children` ở **Root Layout (`src/app/layout.tsx`)**.
**Chiến lược bọc Intro & [lang]**: Việc đặt ở root `app/layout.tsx` là tối ưu nhất vì nó sẽ tự động bọc cả trang Intro `(intro)/page.tsx` lẫn mọi trang đa ngôn ngữ trong `[lang]/...` mà không cần duplicate code layout. Bản thân `layout.tsx` vẫn là Server Component, chỉ có thẻ `AppFrameWrapper` là Client Component (chứa logic `usePathname()`).

**Code mẫu `AppFrameWrapper.tsx`**:
```tsx
"use client";
import { usePathname } from "next/navigation";

export default function AppFrameWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.includes('/checkout');

  if (isCheckout) {
    return <>{children}</>; // Bypass frame cho Checkout
  }

  return (
    <div className="md:max-w-md md:mx-auto md:min-h-[100dvh] md:bg-white md:shadow-2xl md:relative md:overflow-x-hidden md:border-x md:border-gray-200">
      {/* Nền spa-interior.webp sẽ được đặt ở body trong globals.css */}
      {children}
    </div>
  );
}
```

### 2.3. Sửa lỗi Định vị của `position: fixed` (Crucial Bug Fix)
Khi đặt khung `max-w-md` ở giữa, các thẻ con dùng `position: fixed` sẽ định vị theo viewport của trình duyệt, dẫn đến bung ra ngoài khung.
**Hành động**: Cập nhật lại các class CSS Tailwind của các elements này trên toàn dự án.
- **Quy tắc thay thế chung**: Đổi từ `fixed bottom-0 left-0 w-full` thành `fixed bottom-0 inset-x-0 mx-auto w-full max-w-md`. (Dùng `inset-x-0 mx-auto` để căn giữa an toàn nhất, tránh dùng `transform` gây block context).

**Danh sách cụm Components cần sửa (dựa trên kết quả grep):**
1. **VIP Flow (Action Bars)**:
   - `Menu/Premium/StaffSelector/index.tsx`
   - `Menu/Premium/BookingConfig/index.tsx`
   - `Menu/Premium/ConfirmationScreen/index.tsx`
   *(Sửa các `fixed bottom-6 left-6 right-6` thành `fixed bottom-6 inset-x-0 mx-auto max-w-md w-[calc(100%-3rem)]`)*
2. **Standard Menu (Bottom Sheets & Bars)**:
   - `Menu/Standard/Sheets/MainSheet.tsx`
   - `Menu/Standard/Sheets/ReviewSheet.tsx`
   - `Menu/Standard/Sheets/CartDrawer.tsx`
   *(Sửa wrapper của thẻ kéo lên từ `fixed bottom-0 left-0 w-full` thành `fixed bottom-0 inset-x-0 mx-auto w-full max-w-md`)*
   - `Menu/Standard/CategoryPicker.tsx`: Component này đang dùng `fixed inset-0` cho toàn page. **Xử lý**: Đổi thành `fixed inset-y-0 inset-x-0 mx-auto w-full max-w-md` để nó vừa full chiều dọc nhưng bị giới hạn chiều ngang theo khung điện thoại ảo, tránh bung tràn Desktop.
3. **Checkout Mobile Bar**:
   - `[lang]/new-user/[menuType]/checkout/page.tsx`
   - `[lang]/old-user/[menuType]/checkout/page.tsx`
   *(Mobile Action Bar của Checkout cũng cần giới hạn nếu màn hình nằm trong khoảng `md` đến `lg` chưa kịp chuyển sang Desktop layout)*
4. **History & Journey Pages**:
   - `[lang]/old-user/history/page.tsx` (Bottom bar).
   - `Journey/Feedback.tsx` (Thanh action bar ở cuối).

**Xử lý Overlay (Màng đen) của Modal/Sheet**:
- Các thẻ như `fixed inset-0 bg-black/80` của AlertModal, TipModal, PaymentModal... có nên thu gọn vào `max-w-md` không?
- **Quyết định**: KHÔNG. Overlay màng đen nên trải rộng toàn bộ Viewport (`fixed inset-0` giữ nguyên) để tăng độ tập trung cho người dùng. CHỈ thu nhỏ cái thẻ "Nội dung hộp thoại" (Dialog content) nằm giữa màn hình. Modal mặc định đã có `max-w-sm` hoặc `max-w-[400px]` nên sẽ không bị vỡ.

## 2.4. Các Caveats Kỹ Thuật (Technical Caveats)
Để đảm bảo trải nghiệm không bị gãy vỡ khi chuyển đổi kiến trúc, cần đặc biệt lưu ý 3 caveat sau:

1. **Caveat về `position: relative` và `height: auto` ở Desktop**: 
   - Hiện tại `globals.css` khóa cứng `html, body { position: fixed; height: 100dvh }`. Để frame nằm giữa Desktop hoạt động, bắt buộc phải override sang `md:relative md:h-auto` hoặc `min-h-screen`. Nếu thiếu bước này, người dùng sẽ không thể cuộn trang trên Desktop và background ngoài body sẽ không hiển thị đúng.
2. **Caveat về Background (Intro page & Các trang con)**:
   - Hiện tại mỗi page (Intro, Menu...) đều có background riêng (`galaxy.webp`, `bg-blur.webp`,...).
   - **Xử lý**: Giữ nguyên toàn bộ background tĩnh (per-page bg) *bên trong* Phone Frame để trải nghiệm mobile không thay đổi. Trêm mức Desktop (`md:` trở lên), thêm một Background toàn cục (vd: `spa-interior.webp`) gán thẳng vào thẻ `body` để trang trí cho phần không gian thừa bên ngoài Phone Frame.
3. **Caveat về Scroll Container (Danh sách KTV & Dịch vụ)**:
   - Các danh sách dài (như VIP staff list, Standard service list) đang dựa vào behavior cuộn mặc định kết hợp với `position: fixed` của thẻ body để tạo cảm giác native app.
   - Khi gỡ `position: fixed` ở màn hình lớn, hành vi cuộn (scroll) có thể bị "thoát" ra khỏi Phone Frame và cuộn trên toàn Window.
   - **Xử lý**: Cần test kỹ và có thể phải ép kiểu `overflow-y-auto` hoặc `h-[100dvh]` cho phần thẻ bọc danh sách bên trong Phone Frame, đảm bảo scroll chỉ xảy ra *bên trong khung điện thoại*, không làm cuộn cả cửa sổ trình duyệt.

## 3. Các bước Thực hiện (Implementation Steps)

1. **Phase 1: Setup Infrastructure**
   - Sửa `src/app/globals.css`.
   - Tạo `src/components/Shared/AppFrameWrapper.tsx` (Client component) kiểm tra route, render UI App Frame và add Desktop Background.
   - Inject `AppFrameWrapper` vào `src/app/layout.tsx` (hoặc `src/app/[lang]/layout.tsx`).

2. **Phase 2: Sửa Fixed Elements**
   - Đi qua 10+ file đã liệt kê ở phần 2.3. Sửa lại các class `fixed bottom-0` bằng cách nhét thêm `inset-x-0 mx-auto max-w-md`.

3. **Phase 3: Verify Edge Cases**
   - Kiểm tra hành vi scroll dọc trong các List (Staff List, Service List) xem có bị khóa do ảnh hưởng từ globals CSS không.
   - Test safe-area-inset không bị ảnh hưởng.

## 4. Test Plan

Sau khi hoàn thành, tiến hành chụp ảnh màn hình và đối chiếu với tình trạng cũ ở 3 viewport (Mobile 375px, Tablet 768px, Desktop 1568px) tại 6 trang:
1. Intro (`/`) - Đảm bảo khung 448px gọn gàng, có nền background bao ngoài.
2. Customer-Type (`/vi/customer-type`)
3. Select-Menu (`/vi/new-user/select-menu`)
4. Standard Category Picker (`/vi/new-user/standard/menu`)
5. Premium VIP Menu (`/vi/new-user/vip/menu`) - Đảm bảo hết vỡ layout hình thẻ KTV và search bar.
6. Checkout (`/vi/new-user/standard/checkout`) - Đảm bảo ở màn Desktop (1568px) vẫn bung ra layout 2 cột như cũ, không bị bó hẹp vào khung điện thoại.

---
*Vui lòng phản hồi 'OK' hoặc 'Duyệt' để tiến hành thực thi theo plan này.*
