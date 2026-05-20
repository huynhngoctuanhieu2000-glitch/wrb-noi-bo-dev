# Kế Hoạch Triển Khai: Desktop Native Layout (Phương Án B)

## Mục Tiêu
Thay thế giải pháp "App-in-Browser" (khung hẹp giữa màn hình) bằng một giao diện Desktop Native sang trọng, tận dụng tối đa không gian hiển thị rộng của PC/Tablet ngang, trong khi vẫn bảo toàn 100% trải nghiệm Mobile-first hiện tại.

## Nguyên Tắc Cốt Lõi
- **Mobile-First**: Mặc định mọi component vẫn hoạt động như cũ trên màn nhỏ.
- **Tailwind Breakpoints**: Sử dụng `md:` (tablet) và `lg:` (desktop) để override (ghi đè) layout.
- **Bảo toàn Logic**: Không thay đổi bất kỳ business logic, state hay file `.logic.ts` nào. Tập trung hoàn toàn vào UI/UX class.

---

## Các Hạng Mục Chi Tiết

### 1. Luồng VIP Menu (`src/components/Menu/Premium/index.tsx`)
Giao diện VIP cần mang lại cảm giác đẳng cấp trên Desktop, chia làm 2 cột rõ rệt.

- **Layout Tổng (`index.tsx`)**: 
  - Thêm container bao bọc: `lg:max-w-7xl lg:mx-auto lg:px-8`.
  - Ở màn hình Desktop (`lg:`), áp dụng dạng CSS Grid 2 cột: `lg:grid lg:grid-cols-12 lg:gap-10`.
- **Cột Trái (Nội Dung Chính - `lg:col-span-8`)**:
  - Chứa ảnh Hero banner, `StaffSelector` (danh sách KTV) và `BookingConfig` (chọn giờ, chọn dịch vụ).
  - Tối ưu Card KTV: Từ 1 cột trên mobile chuyển thành lưới `lg:grid-cols-2 lg:gap-6` trong `StaffSelector`.
- **Cột Phải (Hóa Đơn / Sidebar - `lg:col-span-4`)**:
  - Biến đổi thanh **Floating Action Bar** (`fixed bottom`) thành một **Sticky Sidebar** cố định bên phải (dùng `lg:sticky lg:top-24`).
  - Hiển thị trực quan KTV đã chọn, tổng tiền, và nút "Tiếp Tục" to rõ ràng.
- **Confirmation Screen (`ConfirmationScreen/index.tsx`)**:
  - Đặt nó trong một container `max-w-3xl mx-auto` với shadow nổi bật giữa màn hình Desktop.
  - Các input (Tên, SĐT, Email) có thể chia thành 2 cột `grid-cols-2` để không quá dài.

### 2. Luồng Standard Menu (`src/components/Menu/Standard/index.tsx`)
Standard Menu thiên về việc lướt xem nhiều dịch vụ cùng lúc.

- **Header / Category Nav (`Header.tsx`)**:
  - Đã fix lỗi lặp category vô cực. Bổ sung `lg:justify-center` để danh mục căn giữa tự nhiên.
- **Service List (`ServiceList.tsx`)**:
  - Cập nhật các card dịch vụ từ 1 cột trải dài thành dạng lưới (Grid): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
  - Tinh chỉnh chiều cao ảnh của `ServiceItem` cho đồng đều trên Desktop.
- **Bottom Sheets (Giỏ hàng, Review, Options)**:
  - Các file `MainSheet.tsx`, `CartDrawer.tsx`, `ReviewSheet.tsx` hiện tại đang dùng `fixed bottom-0`.
  - Trên Desktop (`lg:`), override class để chuyển chúng thành các **Centered Modal** (Nổi ở giữa màn hình) với backdrop làm mờ:
    - Ví dụ: `lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:rounded-3xl lg:max-w-lg lg:h-auto`.

### 3. Trang Checkout & History
- **Trang Checkout (`new-user/.../checkout`, `old-user/.../checkout`)**:
  - Gói toàn bộ nội dung vào `<div className="max-w-4xl mx-auto lg:py-12">`.
  - Ẩn thanh bottom action bar ở Desktop và chuyển nút "Đặt Ngay" vào luồng nội dung chính (Inline button).
- **Trang Lịch Sử (`History/page.tsx`) & Đánh Giá (`Feedback.tsx`)**:
  - Áp dụng pattern Card-based: Khung `max-w-3xl mx-auto`, bo góc `rounded-3xl` và đổ bóng tĩnh `shadow-xl`.

---

## Thứ Tự Triển Khai
- [ ] **Bước 1**: Standard Menu (Service Grid & Modal Sheets) - Vì đây là luồng xem nhiều nhất.
- [ ] **Bước 2**: VIP Menu (2-column Layout & Sticky Sidebar) - Tăng độ Premium.
- [ ] **Bước 3**: Checkout & Feedback (Max-width Centered Cards).

---
*Ghi chú: Việc áp dụng Desktop Native Layout sẽ yêu cầu chạm vào nhiều file UI component. Bạn hãy duyệt plan này để tôi có thể bắt đầu với Bước 1.*
