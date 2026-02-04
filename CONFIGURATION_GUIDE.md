# Hướng Dẫn Cấu Hình Thơi Gian Chốt Đơn (Business Day)

Tài liệu này hướng dẫn cách điều chỉnh thời gian "chuyển ngày" cho hệ thống đơn hàng.

## Mục đích
Hệ thống được cấu hình để các đơn hàng phát sinh vào sáng sớm (ví dụ: 1h sáng) vẫn được tính doanh thu vào **ngày hôm trước**.

## Cách điều chỉnh

### 1. File cần sửa
Mở file: `src/app/api/orders/route.ts`

### 2. Thay đổi giá trị
Tìm dòng code ở ngay đầu file:

```typescript
const DAY_CUTOFF_HOUR = 8; // Reset day at 8:00 AM
```

### 3. Ý nghĩa giá trị
Biến `DAY_CUTOFF_HOUR` quy định giờ mốc để chuyển sang ngày mới.

- **Giá trị hiện tại**: `8` (8 giờ sáng).
- **Quy tắc hoạt động**:
  - Đơn hàng tạo **trước 8:00 sáng** (00:00 - 07:59): Được tính vào **ngày hôm qua**.
  - Đơn hàng tạo **từ 8:00 sáng trở đi**: Được tính vào **ngày hôm nay**.

### 4. Ví dụ
Nếu bạn muốn đổi thành **6 giờ sáng** là mốc chuyển ngày:
Sửa thành:
```typescript
const DAY_CUTOFF_HOUR = 6;
```

Khi đó:
- Đơn lúc 5:59 sáng ngày 4/2 -> Tính là ngày 3/2.
- Đơn lúc 6:01 sáng ngày 4/2 -> Tính là ngày 4/2.
