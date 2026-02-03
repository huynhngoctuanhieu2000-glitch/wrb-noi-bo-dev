# Hướng dẫn Quản lý Hình ảnh (Image Guide)

Tài liệu này hướng dẫn cách thay thế hoặc thêm mới hình ảnh trong dự án `web-noi-bo-ngan-ha`.

## 1. Vị trí hình ảnh
Toàn bộ hình ảnh của dự án hiện được lưu trong thư mục `public/assets/`.
Cấu trúc như sau:

```
public/assets/
├── backgrounds/   # Hình nền (Galaxy, nền mờ...)
├── flags/         # Cờ các nước (Anh, Việt, Hàn...)
├── icons/         # Các icon dịch vụ (Body, Foot, Nails...)
├── logos/         # Logo Ngân Hà Spa (Vàng, Trắng...)
└── payment/       # Hình tiền VND và các loại thẻ
```

## 2. Cách THAY THẾ hình ảnh cũ
Để thay đổi một hình ảnh đang có (ví dụ: muốn đổi hình tờ 500k mới đẹp hơn):

**Bước 1: Chuẩn bị ảnh mới**
- Khuyến khích dùng định dạng **.webp** để web tải nhanh nhất.
- Nếu ảnh của bạn là `.jpg` hoặc `.png`, hãy dùng các trang web chuyển đổi online (Google: "png to webp").

**Bước 2: Đặt tên file**
- Đổi tên file ảnh mới **trùng khớp 100%** với tên file cũ bạn muốn thay.
- *Ví dụ*: Muốn thay tờ 500k, tên file mới phải là `vnd-500k.webp`.

**Bước 3: Chép đè (Overwrite)**
- Copy file mới vào thư mục tương ứng trong `public/assets/...`.
- Máy tính sẽ hỏi "Replace existing file?", chọn **Yes/Replace**.
- Xong! Web sẽ tự cập nhật hình mới (không cần sửa code).

## 3. Cách THÊM hình ảnh mới
Nếu bạn muốn thêm icon hoặc hình mới vào dự án:

1.  Copy ảnh vào thư mục phù hợp (ví dụ `public/assets/icons/mon-moi.webp`).
2.  Mở code (nơi cần dùng ảnh) và sửa đường dẫn.
    - *Lưu ý*: Đường dẫn bắt đầu bằng dấu `/` (không cần chữ public).
    - Ví dụ: `src="/assets/icons/mon-moi.webp"`

## 4. Mẹo tối ưu (Khuyên dùng)
- **Kích thước**: Đừng dùng ảnh quá to (ví dụ 4000px) cho một icon bé xíu. Hãy resize ảnh về kích thước vừa đủ (ví dụ 500x500px) trước khi đưa vào.
- **Tỉ lệ**: Giữ nguyên tỉ lệ (vuông, chữ nhật) giống ảnh cũ để giao diện không bị méo.
