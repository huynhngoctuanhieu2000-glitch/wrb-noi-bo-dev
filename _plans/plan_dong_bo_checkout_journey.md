# Kế hoạch đồng bộ giao diện Check Out & Hành trình khách hàng (Journey)

**Mục tiêu:**
Đồng bộ thiết kế của toàn bộ luồng Check Out, hệ thống Popup/Modals và Hành trình khách hàng (Journey) theo đúng chuẩn thiết kế của mô-đun `Custom For You`. Bổ sung chi tiết về toàn bộ các Popup tại Checkout.

## User Review Required
Đây là bản kế hoạch chi tiết nhất đã được đối chiếu chuẩn màu sắc và bao quát toàn bộ các Modals. Bạn vui lòng đọc và phản hồi thống nhất thiết kế nhé.

## 1. Mã màu chuẩn áp dụng (Từ Custom For You)
Dựa trên báo cáo phân tích, các mã màu chính xác sẽ được sử dụng như sau:
- **Nền chính tổng thể:** `bg-[#0d0d0d]` (Black).
- **Hộp chứa, Hoá đơn, Modal (Cards):** `bg-[#1c1c1e]` (Xám đen) kèm viền `border-white/5` hoặc `border-white/10`.
- **Màu nhấn chuẩn Spa & Call to action (Vàng Gold):** `#C9A96E`
  - Các Nút Confirm: `bg-[#C9A96E] text-black`.
  - Icon, Text nhấn mạnh: `text-[#C9A96E]`.
- **Văn bản thông thường:** Dùng `text-gray-300`, văn bản phụ `text-[#3f3f46]`.
- **Nền báo danh sách (Hover):** `hover:bg-white/5`.

## 2. Các tệp cần điều chỉnh và cách áp dụng

---

## 2. Lộ trình triển khai (Phases)

---

### Phase 1: Đồng bộ Trang Checkout (Main Layout)
Cập nhật màu nền, chữ và viền cho layout chính của luồng Checkout, loại bỏ hoàn toàn các mảng màu xám sáng `bg-[#f8fafc]`.

#### Lược đồ thay đổi:
- **`src/app/[lang]/*/checkout/page.tsx`**: Nền chính đổi thành `bg-[#0d0d0d]`, text chính `text-white`. Nút xác nhận dưới cùng ở mobile đổi thành `bg-[#C9A96E] text-black`.
- **`src/components/Checkout/CheckoutHeader.tsx`**: Header trong suốt hoặc đen với icon & tiêu đề màu Vàng Gold `text-[#C9A96E]`.
- **`src/components/Checkout/CustomerInfo.tsx`**: Nền thẻ đổi thành `bg-[#1c1c1e]`, input nhập liệu dùng `bg-[#0d0d0d]` với chữ Trắng/Vàng.
- **`src/components/Checkout/Invoice.tsx`**: Nền hoá đơn `bg-[#1c1c1e]`. Tách biệt các khoản phí bằng text `text-gray-300`, TỔNG CỘNG dùng chữ to màu Vàng Gold.

---

### Phase 2: Nâng cấp Hệ thống Popup / Modals (Tại Checkout)
Hệ thống popup đang sáng chói với các nút Xanh/Tím sẽ được chuẩn hoá Dark Mode sang trọng, giảm thiểu độ chói mắt cho khách hàng.

#### Lược đồ thay đổi:
Tất cả các overlay popup dùng `bg-black/80` để tạo chiều sâu.
- **`CustomForYouModal`**: Thân popup `bg-[#1c1c1e]`, text Vàng/Trắng.
- **`PaymentModal.tsx` & `ChangeDenominationSelector.tsx`**: Khung `bg-[#1c1c1e]`, Input số tiền và tuỳ chọn mệnh giá nổi bật với border Vàng `#C9A96E`.
- **`PaymentMethods.tsx`**: 
  - Các ô chọn phương thức (Tiền mặt, Thẻ) chuyển về nền `bg-[#1c1c1e]` không viền, khi được chọn sẽ hiện viền `#C9A96E`.
  - Popup hướng dẫn thanh toán bên trong áp dụng nền Đen `#1c1c1e`.
- **`OrderConfirmModal.tsx`**: Popup chốt dịch vụ cuối cùng dùng nền `bg-[#1c1c1e]`. Nút Confirm `bg-[#C9A96E]`.

---

### Phase 3: Nâng cấp Màn hình Hành trình khách hàng (Journey)
Đồng bộ luôn "Waiting Room", "Service List" và "Feedback" ở màn hình theo dõi tiến trình Spa của khách.

#### Lược đồ thay đổi:
- **`src/app/[lang]/journey/[bookingId]/page.tsx`**: Nền `bg-[#0d0d0d]`. Stepper bar (Tiến độ): Các bước đã và đang thực hiện sáng Vàng (`#C9A96E`), chưa thực hiện là Tối (`#1c1c1e`).
- **`src/components/Journey/WaitingRoom.tsx` & `ServiceList.tsx`**: Nền các thẻ thông tin `bg-[#1c1c1e]`, sử dụng text Gold.
- **`src/components/Journey/Feedback.tsx`**: Popup đánh giá: Khung `bg-[#1c1c1e]`. Icon sao đánh giá: `text-[#C9A96E]`. Nút hoàn tất sẽ đồng bộ tone Gold.

## Open Questions
- Với thẻ Hoàn tất / Đánh giá ở Phase 3, có tiếp tục giữ màu nền Xanh nhẹ (`bg-green-50 text-green-500`) hay đồng bộ thành Vàng Gold `#C9A96E` luôn? (Bạn chọn rồi xác nhận 'Approve' để mình chạy Code từ Phase 1 nhé).
