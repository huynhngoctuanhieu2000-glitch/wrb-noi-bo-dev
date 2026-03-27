# Phân tích Lỗi Lộ Trình (Stepper) và Tính Năng Thông Báo Khẩn Cấp / Mua Thêm Dịch Vụ

## 1. Phân Tích Lỗi Stepper Lộ Trình
**Tình trạng:** Khi màn hình Dịch Vụ chạy hết giờ, khung "Nhắc nhở trước khi ra về" (Kiểm Đồ) hiện ra. Tuy nhiên, thanh Tiến trình (Stepper) bên trên vẫn đang sáng (màu cam) tại vòng tròn thứ 2 (DỊCH VỤ) thay vì thứ 3 (KIỂM ĐỒ) như màn hình thực tế.

**Nhận định Kỹ Thuật (Architecture & State Flow):**
- **Điểm yếu của cấu trúc cũ:** `JourneyPage` quản lý biến `state` = `IN_PROGRESS` (từ API). Khối giao diện chính `<ServiceList>` nhận `state` này nhưng lại tự động sinh ra một `view` state cục bộ bên trong nó (từ `TIMER` sang `CHECK_BELONGINGS`). Sự thay đổi nội bộ này không thoát ra ngoài (không propagate state).
- **Hệ quả:** Component cha `JourneyPage` không nhận được sự kiện "chuyến tàu đã qua trạm", nên biểu đồ Stepper dựa theo hàm `getStepIndex()` vẫn giữ mức index=1 (Dịch Vụ).

**Phương án khắc phục:**
1.  **Dùng Context API:** Đẩy trạng thái hành trình lên Context. (Ưu: sạch, Khuyết: Mất thời gian code cho một component chỉ có 1 cấp cha-con).
2.  **State Uplifting (Khuyên dùng):** Thêm hàm callback `onViewChange` truyền từ `JourneyPage` xuống `ServiceList`. Khi bộ đếm ngược tự động kết sổ, `ServiceList` kêu gọi `onViewChange('CHECK_BELONGINGS')`. Parent component bắt được tín hiệu sẽ tự động đẩy Stepper lên index cao hơn.

---

## 2. Phân Tích Lỗi Nút Báo Cáo Không Có Tín Hiệu Về Quầy
**Tình trạng:** Nút "+ Thêm DV" và "Báo Cáo Khẩn Cấp" không gửi được tín hiệu về Dashboard Quản Trị dù đã bắt được click.

**Nhận định Kỹ Thuật (Database & Realtime Pub/Sub):**
- Theo dấu luồng dữ liệu (Data flow): 
    - Nút Click `handleSOS()` -> Fetch API `/api/notifications/emergency` -> Supabase Client (Service Role) gọi `.insert()` -> Table `StaffNotifications`.
    - Dựa vào kết quả debug, row mới ĐƯỢC sinh ra trên cơ sở dữ liệu thành công.
- Vậy tại sao Quầy (Dispatch Board) im lặng?
    - **Hướng (A) - Lỗi Config Supabase:** Bảng `StaffNotifications` mới được tạo (hay thay thế schema cũ) nên chưa được Add Source vào Publication `supabase_realtime`. Các event `INSERT` không được đẩy đi dưới dạng Socket Message.
    - **Hướng (B) - Lỗi Component Quầy Lễ Tân (Frontend):** Ứng dụng Quầy (nếu đang nằm ở `wrb-dashboard` hoặc repo khác) vẫn đang duy trì subscribe vào `.channel('public:Notifications')` (Bảng cũ tên là `Notifications`). Do đó nó mù các tín hiệu gửi tới bảng `StaffNotifications`.

**Phương án Đề xuất:**
Thay vì sửa code API ở đây (gây rủi ro cho những nơi khác đang dùng `StaffNotifications`), Admin hoặc Dev Ops bảo trì hệ thống nên kiểm tra cấu hình bảng **Replication** trên Supabase cho `StaffNotifications`. Nếu Quầy đang gọi nhầm bảng, Quầy cần sửa lại code sub. Khối mã của App Client trong thư mục này đã hoàn thành chính xác đúng nghĩa vụ.
