# Kế hoạch triển khai: Sửa lỗi hiển thị Tiếng Việt khi chọn Tiếng Anh

## Mô tả lỗi hiện tại
1. Màn hình **SERVICES SELECTED** ở giỏ hàng đang hiển thị cứng văn bản `Số lượng (Qty)`.
2. Màn hình **RELAXATION JOURNEY** đang hiển thị danh sách dịch vụ luôn luôn nhận giá trị `nameVN` của Database.

## Các thay đổi thực hiện

### 1. Cập nhật từ điển và file tĩnh trong CartDrawer
#### [MODIFY] CartDrawer.tsx
- Thêm nội dung vào biến `TEXT`: `qty: { vi: 'Số lượng (Qty)', en: 'Quantity', cn: '数量', jp: '数量', kr: '수량' }`
- Sửa phần hiển thị cứng ở thẻ mô tả thành `{t('qty')}`.

### 2. Sửa luồng dữ liệu thời gian thực của hành trình
#### [MODIFY] useJourneyRealtime.ts
- Khai báo thêm `service_name_en?: string;` trong `ServiceItem`.
- Tại bước xử lý `processedItems.push`, thêm logic xử lý fallback `service_name_en: svc?.nameEN || svc?.nameVN` để bảo đảm luôn có giá trị thay thế.

### 3. Phán đoán hiển thị dựa trên URL param lang
#### [MODIFY] WaitingRoom.tsx
- Thay `item.service_name` thành `{lang === 'vi' ? item.service_name : (item.service_name_en || item.service_name)}`
#### [MODIFY] ServiceList.tsx
- Cập nhật dòng render tên dịch vụ `item.service_name` bằng chung 1 cấu trúc kiểm tra `lang` tương tự.
