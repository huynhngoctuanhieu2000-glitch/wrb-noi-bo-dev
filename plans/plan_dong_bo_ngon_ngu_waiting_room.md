# Đồng bộ ngôn ngữ trang Chờ (Waiting Room)

## Mô tả vấn đề
Tại màn hình Chờ (`WaitingRoom`), một số đoạn text đang bị gán cứng (hardcode) bằng cấu trúc `lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'`, dẫn đến việc khi khách hàng chọn ngôn ngữ khác (Hàn, Nhật, Trung), màn hình vẫn hiển thị tiếng Anh. 

Cụ thể các nội dung chưa được đồng bộ trong hình ảnh (ngôn ngữ Trung Quốc - `cn`):
- "ORDER ID"
- "PREPARING"
- Câu chào mừng ("Please enjoy herbal foot bath...")
- Tiêu đề "YOUR JOURNEY"
- Các bước trong lộ trình (Title & Subtitle của 4 bước)

## Kế hoạch triển khai (Đã hoàn thành)

### 1. Cập nhật file `Journey.i18n.ts`
Thêm các từ khóa dịch (translation keys) còn thiếu cho toàn bộ 5 ngôn ngữ (`vi`, `en`, `kr`, `jp`, `cn`). Các key bao gồm:
- `orderId`: "Mã đơn hàng", "Order ID", "订单编号", ...
- `welcomeMessage`: Nội dung câu chào mừng ngâm chân thảo dược.
- `yourJourney`: "Lộ trình dịch vụ", "Your Journey", "您的旅程", ...
- `step1Title`, `step1Sub`, `step2Title`, `step2Sub`, `step3Title`, `step3Sub`, `step4Title`, `step4Sub`: Tiêu đề và mô tả của 4 bước lộ trình.

### 2. Cập nhật file `WaitingRoom.tsx`
- Loại bỏ toàn bộ các điều kiện hardcode `lang === 'vi' ? ... : ...`.
- Sử dụng object `t` (được khởi tạo từ `translations[lang]`) để lấy đúng chuỗi văn bản cho:
  - Text mã đơn hàng (`t.orderId`)
  - Text đang chuẩn bị (`t.preparing`)
  - Lời chào mừng (`t.welcomeMessage`)
  - Tiêu đề lộ trình (`t.yourJourney`)
  - Mảng `journeySteps` (sử dụng `t.step1Title`, `t.step1Sub`, v.v.)
