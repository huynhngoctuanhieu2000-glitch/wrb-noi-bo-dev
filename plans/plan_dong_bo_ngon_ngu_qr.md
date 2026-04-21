# Kế hoạch đồng bộ ngôn ngữ trang Xác nhận đơn (QR Code)

## Mô tả vấn đề
Tại màn hình Xác nhận đơn (hiển thị mã QR trên tablet), có 2 vấn đề:
1. **Chưa đồng bộ ngôn ngữ UI:** Các dòng chữ tiếng Anh bị gán cứng: "Scan QR code to track your service on your phone", "Screen resets in 45s", "<- Reset now".
2. **Mã QR chưa đúng môi trường/ngôn ngữ:** Mã QR được tạo ra bằng một URL gán cứng `https://nganha.vercel.app/${lang}/journey/...`.

## Kế hoạch triển khai (Đã hoàn thành)

### Bước 1: Cập nhật file `src/lib/dictionaries.ts`
Thêm các từ khóa dịch vụ vào object `checkout` cho 5 ngôn ngữ (`vi`, `en`, `cn`, `kr`, `jp`):
- `scan_qr`: "Quét mã QR để theo dõi lộ trình..."
- `screen_resets_in`: "Màn hình tự động làm mới sau"
- `reset_now`: "<- Làm mới ngay"

### Bước 2: Cập nhật file `src/components/Checkout/OrderConfirmModal.tsx`
- **Sửa text UI:** Thay thế các chuỗi gán cứng bằng biến dịch vụ từ `dict.checkout`.
- **Sửa link QR Code:** Cập nhật biến `journeyUrl` để tự động lấy `window.location.origin` thay vì gán cứng domain.
