# 📋 Kế hoạch: Chuyển Cấu Hình BUFFER_MINUTES Lên SystemConfigs (Database)

> **Mục tiêu**: Chuyển thời gian đệm đặt trước `BUFFER_MINUTES = 30` sang lưu trữ trong bảng `SystemConfigs` của database để Admin có thể chỉnh sửa động mà không cần sửa code.

---

## 1. 📊 THAY ĐỔI DATABASE (MIGRATION)
Chèn key cấu hình `menu_vip_buffer_minutes` vào bảng `SystemConfigs` với giá trị mặc định ban đầu là `30`:
```sql
INSERT INTO "SystemConfigs" (key, value)
VALUES ('menu_vip_buffer_minutes', '30')
ON CONFLICT (key) DO NOTHING;
```

---

## 2. 🔌 THAY ĐỔI BACKEND (API GET CONFIG)
* **Tệp ảnh hưởng**: [route.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/app/api/config/menu-vip/route.ts)
* **Logic**: Fetch thêm key `menu_vip_buffer_minutes` từ bảng `SystemConfigs` và trả về trường `bufferMinutes` trong API response:
  ```json
  {
    "enabled": true,
    "pricing": { ... },
    "bufferMinutes": 30
  }
  ```

---

## 3. 🎨 THAY ĐỔI FRONTEND (UI/UX)
* **Tệp ảnh hưởng 1**: [Premium/index.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/index.tsx)
  * Lưu `bufferMinutes` từ API response vào state.
  * Truyền `bufferMinutes` dưới dạng prop vào component `<BookingConfig>`.

* **Tệp ảnh hưởng 2**: [BookingConfig/index.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/BookingConfig/index.tsx)
  * Khai báo thêm prop `bufferMinutes?: number` (mặc định fallback là `30`).
  * Thay thế hằng số cứng `BUFFER_MINUTES` bằng prop `bufferMinutes` nhận được từ DB để tính toán khung giờ trống động.

---

## 🧪 KẾ HOẠCH XÁC MINH
* Chạy SQL chèn config thành công.
* Gọi thử API `/api/config/menu-vip` bằng browser/curl xem có nhận được `bufferMinutes: 30` (hoặc giá trị mới) không.
* Xác nhận trên giao diện: Khi đổi giá trị trong DB thành `10`, khách hàng sẽ đặt được giờ sát thời điểm hiện tại hơn.
