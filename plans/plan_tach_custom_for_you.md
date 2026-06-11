# Tách Biệt Cấu Hình "Custom For You" (Giới tính, Lực, Vị trí)

Mục tiêu: Tách cấu hình "Mục Lực đấm / Giới tính" (showPreferences) hiện tại ở Trang Quản Trị thành các nút tắt/bật riêng biệt: Giới tính, Lực đấm, Vị trí. Từ đó, Web Khách Hàng (wrb-noi-bo-dev) sẽ dựa vào cấu hình này để tự động ẩn/hiện các tab và mục chọn tương ứng trong popup "Custom For You".

## Đề xuất thay đổi

### 1. Database (Supabase)
Thêm 3 cột mới vào bảng `Services`:
- `showGender` (boolean, default `true`)
- `showStrength` (boolean, default `true`)
- `showFocus` (boolean, default `true`)
*(Các cột `showCustomForYou`, `showNotes` đã có sẵn)*

### 2. Trang Quản Trị (Quan_Tri_Va_KTV)

#### [MODIFY] `lib/types.ts`
Thêm 3 trường `showGender`, `showStrength`, `showFocus` vào interface `Service`.

#### [MODIFY] `app/admin/service-menu/EditServiceDrawer.tsx`
Tách gộp `showPreferences` thành 4 mục check riêng:
- Chọn Lực đấm (`showStrength`)
- Chọn Giới tính KTV (`showGender`)
- Chọn Vị trí (`showFocus`)
- (Giữ nguyên `showNotes` và `showCustomForYou`)

#### [MODIFY] `app/admin/service-menu/actions.ts`
Bổ sung `showGender`, `showStrength`, `showFocus` vào payload của hàm `updateService` và `updateServiceBulkSync` để lưu dữ liệu xuống DB.

---

### 3. Web Khách Hàng (wrb-noi-bo-dev)

#### [MODIFY] `src/components/Menu/types.ts`
Cập nhật interface `Service` để nhận các cờ `showGender`, `showStrength`, `showFocus`, `showNotes` từ API (vì `CartItem extends Service` nên modal sẽ lấy được data này).

#### [MODIFY] `src/components/Checkout/CustomRequestModal.tsx`
Cập nhật Logic hiển thị:
- **Tab PREF (Tuỳ chọn Lực & Giới tính):**
  - Nếu `showStrength = false`, ẩn phần chọn Lực đấm.
  - Nếu `showGender = false`, ẩn phần chọn Giới tính KTV.
  - Nếu cả hai đều `false`, tự động ẩn luôn Tab PREF.
- **Tab BODY (Tuỳ chọn Vị trí):**
  - Nếu `showFocus = false`, tự động ẩn luôn Tab BODY.
- **Tab NOTE (Tuỳ chọn Ghi chú):**
  - Nếu `showNotes = false`, tự động ẩn luôn Tab NOTE.

#### [MODIFY] `src/app/[lang]/new-user/[menuType]/checkout/page.tsx`
Cập nhật hàm `handleCustomRequest` truyền thẳng cờ cấu hình của dịch vụ vào modal để modal biết cần phải ẩn hiện mục nào.

## User Review Required

> [!IMPORTANT]
> - Em sẽ cần tạo 3 cột mới (`showGender`, `showStrength`, `showFocus`) trong Database `Services`.
> - Do đó em sẽ dùng Node.js script để ALTER TABLE `Services` tự động thêm 3 cột này (với giá trị mặc định là `true` để không làm mất chức năng của các dịch vụ hiện tại). Anh có đồng ý phương án này không ạ?

Anh xác nhận để em tiến hành triển khai nhé!
