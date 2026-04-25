# Kế hoạch sửa lỗi mất thông tin khách hàng ở Checkout

Nguyên nhân gốc rễ (Root Cause): Hiện tại, thông tin `customerInfo` (tên, email, phone) đang được lưu trữ dưới dạng `useState` cục bộ bên trong component `CheckoutPage` (cho cả luồng `new-user` và `old-user`). Do đó, khi khách hàng nhấn "Back" để quay lại trang menu thêm dịch vụ, component CheckoutPage bị huỷ (unmount) dẫn đến mất toàn bộ state đã nhập.

## Đề xuất thay đổi (Proposed Changes)

Giải pháp là đưa state `customerInfo` lên một global store. Vì dự án đang sử dụng `MenuContext` để quản lý giỏ hàng (`cart`), việc đưa luôn `customerInfo` vào `MenuContext` là phù hợp nhất, giúp thông tin tồn tại xuyên suốt quá trình khách hàng chọn dịch vụ và checkout.

---

### Menu/MenuContext.tsx
Thêm `customerInfo` state và hàm cập nhật vào Context để các trang có thể truy cập chung một nguồn dữ liệu.

- Thêm interface `CustomerInfoState` chứa `name`, `email`, `phone`, `gender`, `room`.
- Khởi tạo state `customerInfo` trong `MenuProvider`.
- Thêm hàm `updateCustomerInfo(field: string, value: string)` và `resetCustomerInfo()` export ra `MenuContextType`.

---

### Checkout Pages
Sửa lại các trang Checkout để dùng `customerInfo` từ `useMenuData()` thay vì `useState` nội bộ.

#### [MODIFY] src/app/[lang]/new-user/[menuType]/checkout/page.tsx
- Loại bỏ `const [customerInfo, setCustomerInfo] = useState(...)`.
- Lấy `customerInfo` và `updateCustomerInfo` từ hook `useMenuData()`.
- Cập nhật hàm `useEffect` tự động điền (auto-fill) từ tài khoản: chỉ điền khi `customerInfo` trong Context đang rỗng.
- Gọi `resetCustomerInfo()` khi submit đơn thành công.

#### [MODIFY] src/app/[lang]/old-user/[menuType]/checkout/page.tsx
- Tương tự như `new-user`.
- Gọi `resetCustomerInfo()` khi submit đơn thành công.

## Yêu cầu bổ sung từ User
- Khi hoàn thành gửi đơn thì reset lại thông tin khách hàng.
