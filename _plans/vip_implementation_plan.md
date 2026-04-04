# 👑 Phân Tích & Kế Hoạch Triển Khai Luồng VIP (Phiên bản Nâng Cao)

Dựa trên các yêu cầu bổ sung mới nhất, luồng VIP đã trở nên phức tạp và linh hoạt hơn nhiều so với dự tính ban đầu. Dưới đây là phân tích chi tiết và kế hoạch triển khai.

## 🎯 Phân Tích Các Yêu Cầu Mới & Thay Đổi Kiến Trúc

### 1. Tùy chọn "Thời Gian" hoặc "Tại Chi Nhánh" (Đến cửa hàng đặt sau)
- **Ý nghĩa:** Khách hàng không bắt buộc phải chọn chính xác khung giờ trước. Họ có thể chọn một KTV (hoặc nhiều KTV) cụ thể và chọn "Đến chi nhánh rồi tính thời gian/dịch vụ sau", thay vì phải chốt ngay trên web.
- **Tác động:** Bước chọn Thời gian / Dịch vụ sẽ có nhánh bỏ qua hoặc placeholder (`TBD` - To Be Determined).

### 2. Chọn Nhiều KTV (Multi-Therapist Booking)
- **Ý nghĩa:** Trong 1 đơn hàng (Cart), khách có thể chọn đặt cho 2 người, mỗi người 1 KTV khác nhau, và mỗi KTV có thể có lộ trình dịch vụ/thời gian riêng.
- **Tác động:** Giỏ hàng (`Cart`) cần sửa đổi, không chỉ lưu danh sách dịch vụ rời rạc mà phải map theo **Group Khách** hoặc **Group KTV**. Payload checkout cũng phải thay đổi.
  - _Ví dụ:_ Khách A -> KTV TuanKiet -> Dịch vụ (Massage 60'). Khách B -> KTV MaiAnh -> Dịch vụ (Massage 90').

### 3. Bảng Map Dịch Vụ Theo Khung Giờ (Dynamic Duration)
- **Ý nghĩa:** Các dịch vụ lẻ (skill) được ghép nối lại. Tổng thời gian tự động cộng dồn. Ví dụ: Massage cổ vai gáy (30p) + Gội đầu (20p) = 50p. Thời gian tổng hợp này sẽ được dùng để tính tiền.
- **Tác động:** Giao diện cần một "Skill Builder" rõ ràng, hiện tổng tiền + tổng thời gian dồn một cách real-time. Không tự ý cộng buffer vì giá tiền phụ thuộc trực tiếp vào thời gian.

### 4. Kiểm Tra Tình Trạng KTV Real-time (Thời gian rảnh)
- **Ý nghĩa:** Nếu KTV đang bận, hiển thị "KTV này sẽ rảnh từ [thời gian cụ thể]". Nếu khách chọn giờ trùng, báo lỗi. Nếu chọn dịch vụ dài hơn khe hở thời gian rảnh, báo quá giờ.
- **Tác động:** Đòi hỏi một hệ thống real-time availability check mạnh mẽ (Gọi API từ Supabase để tính toán các `booking` hiện tại). Giao diện TimeSlot Picker phải có trạng thái _disable/enable_ từng slot dựa trên độ dài của dịch vụ (duration).

---

## 🏗️ Kiến Trúc Mới & Sửa Đổi Luồng VIP

Dựa trên phân tích trên, luồng VIP mới sẽ có cấu trúc linh hoạt hơn:

### A. Giao diện (Premium Menu) - State Machine

Thay vì 1 đường thẳng cứng nhắc, ta có một bộ State Machine linh hoạt cho Flow Đặt Lịch:

1. **Bước 1: Chọn Tùy Chọn Đặt Hẹn (Booking Type)**
   - [A] - Đặt cụ thể Khung Giờ & Dịch Vụ
   - [B] - Chỉ chọn KTV, đến Chi Nhánh tính sau.

2. **Bước 2: Chọn Số Lượng Khách & Chọn KTV (Multi-Select)**
   - Hỏi: "Bạn đặt cho mấy người?" -> [2]
   - Hiển thị danh sách KTV -> Cho phép chọn 2 KTV (KTV 1 cho Khách 1, KTV 2 cho Khách 2).
   - _Hiển thị ngay tag trạng thái trên thẻ KTV:_ "Rảnh" / "Bận (Rảnh sau 14:00)".

3. **Bước 3: Tối ưu Lộ Trình / Dịch Vụ (Chỉ hiện nếu chọn loại [A])**
   - Với mỗi KTV đã chọn -> Có nút `Tổ hợp dịch vụ` -> Mở ra bảng map Dịch vụ (Skill).
   - Khi check các dịch vụ -> Tổng thời gian (`duration`) tự tính toán hiện ra.

4. **Bước 4: Chọn Khung Giờ Chung (TimeSlot)**
   - Giao diện TimePicker.
   - Gọi API gửi danh sách KTV đã chọn + Duration lâu nhất.
   - Trả về danh sách Khung Giờ Khả Dụng (Chỉ những slot mà **TẤT CẢ** các KTV được chọn đều rảnh trong khoảng thời gian đó mới hiện).

5. **Bước 5: Thêm vào Checkout (Dùng chung Checkout cũ có nâng cấp)**
   - Đẩy toàn bộ cấu trúc VIP vào Checkout hiện tại.

### B. Nâng Cấp Dữ Liệu (Payload & State)

Để Checkout hoạt động được, cấu trúc trong Context/Cart cần bổ sung:

```typescript
// Định nghĩa mới cho giỏ hàng
interface VipBookingSession {
    bookingType: 'SPECIFIC' | 'BRANCH_DECIDE';
    timeSlot: string | null;  // Khung giờ chọn chung HOẶC null
    pax: number;
    assignments: {           // Mảng chứa các phân công KTV -> Khách
       guestIndex: number;   // Khách số 1, Khách số 2
       staffId: string;
       staffName: string;
       duration: number;     // Tổng thời gian của KTV này
       skills: string[];     // Danh sách ID dịch vụ đã chọn cho KTV này
    }[];
}
```

Dữ liệu này sẽ được lưu ở `localStorage` (như đã phân tích ở phương án trước) và báo cho MenuContext để đẩy xuống Checkout.

### C. Định Hướng UI/UX & Tương Tác 🎨

Để đồng bộ với trải nghiệm "Luxury Spa" (Deep Black & Gold, Mobile First), luồng VIP sẽ áp dụng các nguyên tắc thiết kế sau:

1. **Giao Diện "Matte Black" & "Luxurious Gold":**
   - Toàn bộ Background sử dụng dải màu `bg-[#0d0d0d]` đến `bg-[#1c1c1e]`.
   - Các Call-to-action (nút bấm, focus) sử dụng dải màu Gold `#C9A96E` và gradient.
   - Tránh màu xám ám xanh, chỉ dùng Neutral Grays (`gray-400`, `gray-500`, `gray-700`).

2. **TimeSlot Picker Hiện Đại (Horizontal Scroll):**
   - Không dùng Select Box cứng nhắc. Thay vào đó dùng các "Time Chips" vuốt ngang (như lịch hẹn của ứng dụng cao cấp).
   - Slot khả dụng: Chữ trắng nền xám. 
   - Slot đã chọn: Nền màu Gold chữ đen kèm hiệu ứng Glow (Soft Shadow).
   - Slot không khả dụng (bận): Opacity 40%, không click được.

3. **Status KTV Real-time (Micro Interactions):**
   - Trên góc ảnh thẻ của KTV sẽ có chấm tròn kèm Badge trạng thái.
   - 🟢 Rảnh: Chấm xanh lá cây (hoặc viền Gold) + Text "Rảnh".
   - 🔴 Đang làm khách: Chấm đỏ + Text mờ "Rảnh sau 15:30".

4. **Skill Builder Cực Kỳ Trực Quan (Checklist & Progress Bar):**
   - Mỗi dịch vụ sẽ như một hộp tùy chọn (Checkbox dạng Card). 
   - Khi khách chọn, xuất hiện hiệu ứng trượt nhẹ (Framer Motion).
   - Ở thanh Footer (được pinned dưới đáy - `pb-safe`), hiển thị thanh tổng kết luôn nảy lên (spring animation) mỗi khi duration/price thay đổi (ví dụ: `50 mins | 500.000 VND`).

5. **Trải Nghiệm Sheets Mượt Mà:**
   - Hạn chế tối đa chuyển trang rườm rà. Bảng chọn KTV -> Bảng chọn Dịch vụ -> Chọn Khung Giờ sẽ được hiển thị như một chuỗi Step-by-Step hoặc đè bằng các Bottom Sheets giống như ở `StandardMenu`.

---

## 📅 Kế Hoạch Triển Khai (3 Phase)

### Phase 1: Nền tảng Dữ Liệu & API (Backend)
- [ ] Xây dựng API (hoặc sửa API hiện tại) `/api/vip/availability` để tính toán thời gian rảnh của KTV.
  - Chức năng: Nhận đầu vào là mảng `staff_ids`, `date`, `duration_required`. Trả về trạng thái của từng KTV (Đang bận, rảnh sau mấy giờ) và Khung giờ khả dụng chung.
- [ ] Nâng cấp cấu trúc `MenuContext` và Checkout Page để đọc và xử lý payload VIP có chứa Nhiều Khách + Nhiều KTV + Chọn tại chi nhánh.

### Phase 2: Giao diện Chọn KTV Nâng Cao (Bước 1 & 2)
- [ ] Chỉnh sửa `MenuTypeSelector` chọc đúng vào `/premium/menu`.
- [ ] Build component `VipOptions` (Chọn loại đặt: Cụ thể vs Chi nhánh).
- [ ] Build component `StaffMultiSelector`:
  - Hiển thị danh sách KTV.
  - Tích hợp API rảnh/bận để hiển thị label real-time ("Rảnh lúc X").
  - Cho phép chọn nhiều KTV (giới hạn bằng số khách).

### Phase 3: Giao Diện Tổ Hợp Dịch Vụ & Khung Giờ (Bước 3 & 4)
- [ ] Build component `SkillBuilder` (Áp dụng UI Component Checklist).
  - Hiển thị danh sách skill (Massage, Gội đầu, ngâm chân...).
  - Tính toán tự động "Biểu đồ thời gian" (`duration`).
- [ ] Build component `TimeSlotPicker` (UI Vuốt Ngang).
  - Chọn Giờ + check khả dụng liên KTV.
- [ ] Kết nối tất cả, Push vào Checkout. 

---

## ❓ Câu Hỏi Xác Nhận (Phần Cần Review)
> [!IMPORTANT]
> - Về việc chọn **Tại chi nhánh**: Có nghĩa là lúc Checkout, giá tiền và thông tin dịch vụ sẽ trống (chỉ có thông tin hẹn với KTV đó lúc mấy giờ). Xin xác nhận tính năng này trên Dashboard quản lý có hỗ trợ tạo đơn "Chưa có dịch vụ" hay không?
> - Về chọn **Thời gian rảnh KTV**: Nếu khách chọn đặt cho 2 người (chọn 2 KTV), nhưng KTV A rảnh lúc 14:00, KTV B rảnh lúc 15:00. Bạn muốn cho khách đặt **cùng 1 lúc (chỉ lúc 15:00 mới đặt chung được)** hay cho phép **mỗi KTV đặt 1 giờ khác nhau** trong cùng 1 bill? (Thiết kế chung giờ sẽ đơn giản dễ quản lý phòng hơn).

Bạn xem qua phân tích này, xác nhận các câu hỏi để mình chốt Plan và tiến hành code từ Phase 1 nhé!
