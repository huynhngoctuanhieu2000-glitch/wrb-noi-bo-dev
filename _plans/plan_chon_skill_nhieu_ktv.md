# Kế Hoạch Triển Khai: Chọn Skill Theo KTV & Gợi Ý Thời Gian Động

## 1. Phân Tích Các Trường Hợp Logic Thời Gian

Dựa trên nguyên tắc: *"Thời gian tối thiểu dựa trên các skill đã chọn, nhưng khách có quyền mua thêm thời gian linh hoạt."*

- **Danh sách thời gian tiêu chuẩn của Spa:** `[60, 70, 80, 90, 100, 110, 120, 150, 180, 210, 240]` (phút).
- Theo nguyên lý **Max-Min**, hệ thống sẽ tính: `minRequired = MAX(tổng_thời_gian_skill_KTV_1, tổng_thời_gian_skill_KTV_2)`.

**Các Use Cases Cụ Thể:**
1. **Khách chọn 1 KTV (Body - 60p):** 
   - Min = 60p. 
   - Danh sách gợi ý: `60p, 70p, 80p, 90p, 100p, 120p...` Khách có quyền mua bao lâu tuỳ thích.
2. **Khách chọn 1 KTV (Ray Body - 70p) (Giả định môn mới):**
   - Min = 70p.
   - Danh sách gợi ý tự động cắt bỏ mốc 60p, chỉ hiển thị: `70p, 80p, 90p, 100p, 120p...`.
3. **Khách chọn 2 KTV lệch giờ nhau:** 
   - KTV 1: Body (60p) + Aromatherapy (60p) = 120p.
   - KTV 2: Facial (45p) = 45p.
   - => `minRequired` = 120p. 
   - Danh sách gợi ý cho cả Booking: `120p, 150p, 180p...`. Cả 2 KTV sẽ phục vụ trọn 120p (KTV 2 sẽ giãn thời gian chăm sóc mặt hoặc bonus).
4. **Trường hợp mốc dở dang (VD: 45p, 75p):**
   - Nếu `minRequired` là 75p, hệ thống đưa 75p vào thẻ đầu tiên, các thẻ tiếp theo lấy từ Array chuẩn: `75p, 80p, 90p, 100p...`

## 2. Giải Pháp Giao Diện (UI/UX)

- **Màn hình BookingConfig:**
  - Sẽ sử dụng **Giao diện Tabs** cho phần "KỸ NĂNG CHUYÊN BIỆT" nếu có từ 2 KTV trở lên. Ví dụ: Tab `[Minh Anh] [Tuấn Kiệt]`. Điều này giữ cho UI sạch sẽ (Mobile-First).
  - Tích hợp khu vực **"CHỌN THỜI GIAN DỊCH VỤ"**: Hiển thị dãy chips dạng scroll ngang, với các tuỳ chọn hợp lệ. Nút 60p sẽ tự động vô hiệu hoá nếu khách lỡ chọn skill >= 70p.
  - Sửa bug hiển thị giá: Giá cuối cùng phải bằng = `(totalDuration/60) * VIP_PRICE * số_KTV`.
- **Màn hình ConfirmationScreen:**
  - Mục Dịch vụ đã chọn được hiển thị theo cụm của từng KTV. "Minh Anh: Deep Tissue, Facial...".

## 3. Lộ Trình Code (Thực Thi)

1. Cập nhật `mockData.ts`:
   - Thêm `sk_ray_body` (Ray Body) với `duration = 70` để test tính năng cắt mốc 60p.
2. Thay đổi `Premium/index.tsx`: 
   - Đổi state: `selectedSkills` -> `selectedSkillsMap: Record<string, string[]>`. 
   - Đảm bảo function handle điều hướng trơn tru.
3. Sửa lớn tại `Premium/BookingConfig/index.tsx`:
   - Áp dụng Tabs chọn KTV.
   - Render logic tính toán `options` thời gian.
   - Bắt validation (phải chọn ít nhất 1 skill/KTV và phải chốt 1 mốc thời gian).
4. Sửa `Premium/ConfirmationScreen/index.tsx`:
   - Bind dữ liệu lại để hiển thị.

Đã chốt kế hoạch, tiến hành code.
