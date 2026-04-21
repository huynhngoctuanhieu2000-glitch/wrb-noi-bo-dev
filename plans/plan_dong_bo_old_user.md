# Kế hoạch đồng bộ ngôn ngữ luồng khách cũ (Old User Flow)

## Mô tả vấn đề
1. **Trang Lịch sử (`cn/old-user/history`)**: Các dịch vụ bên trong thẻ lịch sử vẫn hiển thị bằng tiếng Việt do API thiếu dữ liệu dịch thuật đa ngôn ngữ.
2. **Trang Xác nhận (Checkout / Invoice)**: 
   - Tùy chọn Lực (`strength`) và KTV (`therapist`) hiển thị tiếng Việt do logic map ngược bị sai khi phục hồi giỏ hàng (restoreCart).
   - Chữ "Total" và "*Price includes VAT" đang bị gán cứng bằng tiếng Anh.

## Kế hoạch triển khai (Đã hoàn tất)

### Bước 1: Sửa API lấy đơn hàng (`src/app/api/orders/route.ts`)
- **Hoàn thành**: Cập nhật hàm `GET` để query thêm các trường `nameCN, nameKR, nameJP` từ bảng `Services`. Dữ liệu trả về cho frontend đã bao gồm object `names`.

### Bước 2: Sửa trang Lịch sử (`src/app/[lang]/old-user/history/page.tsx`)
- **Hoàn thành**: Cập nhật cách render tên dịch vụ thành `{item.names?.[lang] || item.name || ...}`.
- **Hoàn thành**: Sửa hàm `restoreCart`. Đã đem `mapVal` và `mapBodyPart` ra ngoài khối check `if (!item.options)`, đảm bảo mọi option (như "Vừa", "Nữ", "Cổ", "Vai") sinh ra từ lịch sử (tiếng Việt) đều được chuyển ngược về mã tiêu chuẩn tiếng Anh (medium, female, NECK, SHOULDER) để hệ thống nhận diện và dịch động.

### Bước 3: Sửa giao diện Invoice (`src/components/Checkout/Invoice.tsx`) & File dịch
- **Hoàn thành**: Cập nhật chữ gán cứng `"Total"` và `"*Price includes VAT"` thành `dict.checkout.total_bill` và `dict.checkout.price_includes_vat`.
- **Hoàn thành**: Bổ sung `price_includes_vat` vào `dictionaries.ts`.
