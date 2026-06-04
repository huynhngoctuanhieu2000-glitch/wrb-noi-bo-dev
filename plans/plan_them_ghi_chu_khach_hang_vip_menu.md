# Kế hoạch thêm ô Ghi Chú cho Khách hàng trên VIP Menu

Tài liệu này mô tả kế hoạch thiết kế giao diện và tích hợp dữ liệu cho ô "Ghi chú của khách hàng" trên màn hình cấu hình VIP Menu, đảm bảo cân đối cho cả 2 luồng: đi ngay tại tiệm (Walk-in) và đặt lịch trước (Advance Booking).

## Đề xuất Giải Pháp & Trải nghiệm người dùng (UX)

### 1. Vị trí hiển thị & Layout
*   **Vị trí:** Ô ghi chú sẽ được đặt ở cuối form cấu hình của `BookingConfig`, ngay sau phần chọn hình thức sử dụng (và dưới phần chọn ngày/giờ nếu là đặt trước).
*   **Khi chọn "Đến trực tiếp (Walk-in)":** Form sẽ gọn gàng, gồm: Chọn thời gian $\rightarrow$ Chọn đến trực tiếp $\rightarrow$ **Ghi chú của bạn**.
*   **Khi chọn "Đặt lịch trước (Advance)":** Form tự động mở rộng, gồm: Chọn thời gian $\rightarrow$ Chọn đặt lịch trước $\rightarrow$ Chọn ngày $\rightarrow$ Chọn giờ $\rightarrow$ **Ghi chú của bạn**.
*   Cách bố trí này giúp giao diện luôn cân đối, gọn gàng, và người dùng luôn nhập ghi chú ở bước cuối cùng ngay trước khi bấm "Xác nhận lựa chọn".

### 2. Sự đồng bộ giữa 2 màn hình (Đối với Đặt lịch trước)
*   Khi khách hàng nhập ghi chú tại màn hình chọn dịch vụ (`BookingConfig`), thông tin này sẽ được tự động điền (pre-fill) sang ô ghi chú tại màn hình xác nhận thông tin liên hệ (`ConfirmationScreen`). Khách hàng có thể kiểm tra lại hoặc chỉnh sửa nếu cần.

## Chi tiết các file sẽ sửa đổi

### 1. [NEW keys] [Premium.i18n.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/Premium.i18n.ts)
Thêm từ khóa đa ngôn ngữ cho phần ghi chú ở 5 thứ tiếng (vi, en, kr, cn, jp):
*   `bc_customerNotes`: Tiêu đề phần ghi chú (VD: 'GHI CHÚ CỦA BẠN').
*   `bc_notesPlaceholder`: Gợi ý nhập liệu (VD: 'Nhập các yêu cầu đặc biệt...').

### 2. [MODIFY] [BookingConfigProps] [BookingConfig/index.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/BookingConfig/index.tsx)
*   Thêm state `customerNotes` (string) lưu nội dung ghi chú.
*   Thêm UI `textarea` ở cuối form nằm trong khối `selectedDuration` của Framer Motion.
*   Bổ sung tham số `customerNotes` vào payload của hàm `onConfirm` khi người dùng bấm xác nhận.

### 3. [MODIFY] [MenuContext.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/MenuContext.tsx)
*   Cập nhật hàm `addVipToCart` nhận thêm tham số `customerNotes?: string`.
*   Lưu ghi chú này vào trường `vipCustomerNotes` trong đối tượng `CartItem`.

### 4. [MODIFY] [handleVipItems.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/app/api/orders/handleVipItems.ts)
*   Khi checkout tại quầy (Walk-in), hàm này sẽ lấy `vipCustomerNotes` từ CartItem và ghi vào trường `options.customerNotes` của bảng `BookingItems` trong Supabase để Admin có thể xem được ghi chú.

### 5. [MODIFY] [Premium/index.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/index.tsx) (Parent)
*   Thêm state `customerNotes` ở parent component để làm cầu nối truyền dữ liệu giữa `BookingConfig` và `ConfirmationScreen`.
*   Truyền `customerNotes` vào `addVipToCart` (Walk-in) và truyền `initialCustomerNotes` vào `ConfirmationScreen` (Đặt lịch trước).

### 6. [MODIFY] [ConfirmationScreen/index.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/ConfirmationScreen/index.tsx)
*   Nhận prop `initialCustomerNotes` làm giá trị mặc định ban đầu cho state `customerNote`.

### 7. [MODIFY] [vip-appointment/route.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/app/api/booking/vip-appointment/route.ts) (API Đặt lịch trước)
*   Destruct trường `customerNote` gửi lên từ client.
*   Lưu `customerNote` vào object `notes` dạng JSON của bảng `Bookings` trong Supabase.
*   Hiển thị thông tin ghi chú này trên tin nhắn Staff Notification / Telegram (`StaffNotifications` table).

## Kế hoạch kiểm thử (Verification Plan)
1. **Biên dịch:** Chạy `npm run build` kiểm tra lỗi TypeScript.
2. **Kiểm thử giao diện:**
   *   Chọn dịch vụ, KTV, chọn Duration $\rightarrow$ Ô ghi chú xuất hiện.
   *   Thử chuyển đổi qua lại giữa "Đến trực tiếp" và "Đặt lịch trước" để đảm bảo ô ghi chú hiển thị mượt mà ở dưới cùng.
3. **Kiểm thử luồng đi ngay (Walk-in):**
   *   Nhập ghi chú $\rightarrow$ Chọn đến trực tiếp $\rightarrow$ Bấm Xác nhận.
   *   Kiểm tra xem dữ liệu ghi chú có được gửi lên API `/api/orders` trong payload của cart item hay không.
4. **Kiểm thử đặt lịch trước (Advance Booking):**
   *   Nhập ghi chú $\rightarrow$ Chọn đặt lịch trước $\rightarrow$ Chọn Ngày/Giờ $\rightarrow$ Bấm Xác nhận.
   *   Kiểm tra màn hình xác nhận thông tin liên hệ xem ô Ghi chú có được pre-fill đúng nội dung đã nhập không.
   *   Bấm gửi đặt lịch và kiểm tra API `/api/booking/vip-appointment` nhận được ghi chú.
