# 👑 Phân Tích & Kế Hoạch Triển Khai Luồng VIP (Bản Cập Nhật UI/UX + Ca Trực)

Kế hoạch này được điều chỉnh mở rộng siêu cấp dựa trên 3 insight cốt lõi bổ sung tính giá động:
(1) Điều hướng trải nghiệm: Theo Skill hoặc Theo Nhân Viên.
(2) **Bespoke Pricing (Tính giá theo Thời Gian)**: Không cộng dồn giá dịch vụ lẻ tẻ, giá VIP được tính duy nhất qua hệ số `Chất xám Thời gian` (Ví dụ 200k/60 phút).
(3) Quản lý Nghỉ Phép / Rớt Ca (Shift Logic): Xác định ngày làm việc để điều hướng đặt lịch chuẩn xác.

---

## 🏗️ Kiến Trúc State Machine Giao Diện Mới Nhất

1. **Bước 1: Welcome & Ý Định Ban Đầu (Intent Selector)**
   - Màn hình trượt chữ nghệ thuật hỏi: *"Niềm vui hôm nay của bạn là gì?"*
   - [Lựa chọn 1]: **Chăm sóc theo nhu cầu** -> Dẫn vào Category List -> Lọc KTV làm hôm đó và có Priority Skill lên đầu.
   - [Lựa chọn 2]: **Gặp kỹ thuật viên quen** -> Dẫn thẳng vào Sảnh KTV (Staff Selector) bỏ qua bộ lọc ngày.

2. **Bước 2: Sảnh KTV (Cấp độ Chọn Nhân Sự)**
   - Khách có thể chọn n-KTV (Co-working).
   - Thẻ hiển thị ngày làm việc và bắt lịch nghỉ (Nếu chọn trúng ngày nghỉ, mời đổi sang Lịch làm tiếp theo của KTV đó).

3. **Bước 3: Skill & Duration Builder (Tính tiền kiểu VIP Tối Giản)**
   - Khách tick chọn các Skill mong muốn từ những KTV. Bảng kéo ra thời gian gộp.
   - ⚡ **THUẬT TOÁN TÍNH TIỀN THEO GIỜ**: Hệ thống sẽ load biến `vip_price_per_60min = 200.000` từ `SystemConfigs`. Tiền khách phải trả KHÔNG phụ thuộc vào việc khách làm bao nhiêu loại Skill, mà **Phụ thuộc vào tổng số phút phục vụ**. (VD: Làm 90 phút -> `(90/60) * 200k = 300k`). Trải nghiệm này vô cùng cao cấp (Bespoke Spa Therapy).

4. **Bước 4: TimeSlot (Khung Giờ Rảnh Tập Thể)**
   - Tìm slot rảnh của Team Nhân sự đã chọn trong Ngày đã chốt.
   - Hoặc chốt "Chờ Chi Nhánh Sắp Xếp / Gọi đến lấy vé" -> PUSH Firebase sang lễ tân.

5. **Bước 5: Thanh Toán & Ghi Nhận**
   - Lưu trữ `VipBookingSession` với giá tự động render theo thời gian.

---

## 🎨 Tích Hợp Database (Supabase) Trọng Điểm 🗄️

1. **Table `SystemConfigs`**:
   - Query Key: `vip_price_per_60min`. Dùng làm hệ số gốc tính tiền giỏ hàng (`CartContext`). Giúp Manager thay đổi giá cực kỳ nhanh chóng từ DB mà không cần sửa code.
2. **Table `Staff`**: Render avatar và JSONB `skills`. Chặn ngày nghỉ.
3. **Table `TurnQueue`**: Lặp vòng Check rảnh/bận bằng `status='working'` và `estimated_end_time`.
4. **Table `Services`**: Nơi lấy `duration` cho từng skill tick.

---

## 📅 Lộ Trình Triển Khai Thực Tế Mới (3 Phase Cập Nhật)

### Phase 1: Mở rộng Back-end, Tracking Lịch & Tính Giá Động
- [ ] API cấu hình chung `SystemConfigs` lấy biến `vip_price_per_60min`. Xây dựng hàm `calculateVipPrice(totalMinutes)`.
- [ ] API lấy KTV Availability: Trả về trạng thái Đi Làm/Nghỉ Làm.
- [ ] Bẻ lái `MenuContext`: Chấp nhận thuật toán cộng tiền theo Giờ, Override lại thuật toán cộng tiền theo Item cũ của giỏ hàng khi người dùng chọn `menuType = premium`.

### Phase 2: Chế Tác Giao Diện Vào KTV Không Gian VIP
- [ ] Component Option Ý định (Intent selector).
- [ ] Component `StaffCard`: Làm hiệu ứng Nghỉ phép -> Dẫn dắt khách đổi Ngày để giữ KTV. Cho phép Select Multiple.

### Phase 3: Bảng Cấu Hình Dịch Vụ & TimeSlot Custom
- [ ] `SkillBuilder`: Bảng checkbox theo KTV. Bàn phím số tự nhảy TIỀN (VND) dựa trên tổng GIỜ.
- [ ] `TimeSlotPicker`: Hệ thống cắm chip khung giờ rảnh nhóm.
- [ ] Đẩy checkout Final.
