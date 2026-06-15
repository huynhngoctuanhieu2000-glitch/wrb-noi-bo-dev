# Kế Hoạch Sửa Lỗi Không Load Được Menu

## Mô tả Vấn đề
Thỉnh thoảng khi khách hàng vào web (trên môi trường Vercel production), phần thân chứa danh sách món (tinh dầu, gội đầu, v.v.) không hiện ra, chỉ hiện thanh phân loại (Category) ở trên cùng.

**Nguyên nhân gốc rễ:**
1. **Vercel Cold Start:** Serverless function `/api/services` trên Vercel có thể bị "ngủ" nếu không ai truy cập một lúc. Khi có người vào, nó mất nhiều thời gian để khởi động lại, dẫn đến request bị timeout.
2. **Thiếu Retry & Timeout:** Hàm gọi API (`getServices.ts`) gọi 1 lần, nếu thất bại (hoặc timeout) sẽ trả về `[]` và không tự thử lại.
3. **Fail Silently (Không báo lỗi):** Giao diện không xử lý trạng thái Lỗi. Khi mảng dữ liệu rỗng `[]`, phần thân danh sách sẽ trống tinh, không có thông báo hay nút Retry để khách hàng tải lại.

## Đề xuất Giải pháp

### 1. Nâng cấp cơ chế gọi API (`getServices.ts`)
- Thêm **Timeout** (8 giây) bằng `AbortController`.
- Thêm **Auto-Retry**: Tự động thử lại tối đa 3 lần nếu gọi API thất bại.

### 2. Cải thiện Giao diện (UI/UX)
- Bổ sung **Loading Skeleton** hiển thị khi đang chờ data.
- Bổ sung **Error UI & Nút Retry**: Nếu sau 3 lần vẫn lỗi, hiển thị nút "Tải Lại Dữ Liệu" ở ngay phần thân màn hình.

### 3. Tối ưu Route Cache (`route.ts`)
- Bổ sung Cache Header giúp Vercel trả kết quả nhanh hơn, tránh việc dính Cold Start cho mọi khách hàng.
