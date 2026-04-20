# Đồng bộ ngôn ngữ tên dịch vụ trong Lộ trình khách hàng

## Mô tả Vấn đề
Dựa trên hình ảnh cung cấp, tên dịch vụ hiển thị ở màn hình Lộ trình Khách hàng (trong thời gian đếm ngược của `TabTimerView`) đang bị hiển thị bằng tiếng Việt ("Gói lấy ráy tai 3 + Gội đầu") mặc dù ngôn ngữ đang chọn là tiếng Hàn ("휴식 여정", "서비스").

## Nguyên nhân gốc rễ (Root Cause)
1. Tên dịch vụ hiển thị ở màn hình đếm ngược (`TabTimerView`) được lấy từ thuộc tính `combinedName`.
2. `combinedName` được tạo ra thông qua hàm `groupItemsByTech` nằm trong file `src/components/Journey/Journey.logic.ts`.
3. Hàm `groupItemsByTech` hiện tại đang sử dụng trực tiếp `i.service_name` (luôn là tiếng Việt/mặc định) để gộp tên, mà không nhận tham số `lang` để lấy tên dịch vụ từ object `service_names` đã được đa ngôn ngữ hóa.

## Kế hoạch Triển khai (Đã hoàn thành)

### 1. Cập nhật `src/components/Journey/Journey.logic.ts`
- Bổ sung tham số `lang` (kiểu `string`, mặc định là `'vi'`) vào hàm `groupItemsByTech`.
- Tạo một biến cục bộ để lấy tên dịch vụ theo ngôn ngữ: `const getLocalizedName = (i: ServiceItem) => i.service_names?.[lang] || i.service_name;`.
- Cập nhật quá trình tạo mảng `names` để sử dụng `getLocalizedName` thay vì `i.service_name`.

### 2. Cập nhật `src/components/Journey/ServiceList.tsx`
- Trong component `TabTimerView`, truyền prop `lang` vào khi gọi hàm `groupItemsByTech`:
  ```tsx
  const groups = groupItemsByTech(items || [], lang || 'vi');
  ```
