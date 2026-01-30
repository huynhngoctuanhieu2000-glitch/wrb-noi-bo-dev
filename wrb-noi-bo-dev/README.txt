# Web Nội Bộ Ngân Hà (Ngan Ha Internal Web)

Hệ thống đặt lịch, chọn menu và quản lý trải nghiệm khách hàng tại **Ngan Ha Spa**. Dự án được xây dựng với công nghệ hiện đại, tối ưu hóa cho trải nghiệm người dùng trên thiết bị di động và máy tính bảng.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

*   **Frontend**: [Next.js 16.1.4](https://nextjs.org/) (App Router, Turbopack)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
*   **UI/Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animation**: Tailwind animate, Custom CSS keyframes

---

## 🛠️ Cài Đặt & Chạy Dự Án (Installation & Setup)

### 1. Yêu cầu (Prerequisites)
*   **Node.js**: Phiên bản 20.x trở lên (Khuyến nghị).
*   **Package Manager**: npm, yarn, hoặc pnpm.

### 2. Cài đặt (Install)

```bash
# Clone dự án về máy
git clone <repository_url>
cd wrb-noi-bo-dev

# Cài đặt thư viện dependencies
npm install
```

### 3. Cấu hình Môi trường (.env.local)
Tạo file `.env.local` tại thư mục gốc và điền thông tin Firebase của bạn:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Chạy ứng dụng (Run)

```bash
# Chạy môi trường phát triển (Development)
npm run dev

# Mở trình duyệt tại: http://localhost:3000
```

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

Dự án tuân theo kiến trúc **Feature-based** và **Modular** của Next.js App Router.

```
src/
├── app/                        # App Router (Pages & Layouts)
│   ├── (intro)/                # Nhóm trang Introduction (Layout riêng)
│   ├── [lang]/                 # Dynamic Route cho đa ngôn ngữ (vn, en, jp, cn, kr)
│   │   ├── customer-type/      # Màn hình chọn loại khách (Mới / Cũ)
│   │   ├── new-user/           # Luồng Khách Hàng Mới
│   │   │   ├── select-menu/    # Chọn gói (Standard / Premium)
│   │   │   ├── [menuType]/     # Chi tiết menu & Checkout
│   │   │   └── ...
│   │   └── old-user/           # Luồng Khách Hàng Cũ
│   │       ├── history/        # Xem lịch sử đơn hàng
│   │       └── ...
│   ├── layout.tsx              # Root Layout
│   └── globals.css             # Global Styles
│
├── components/                 # UI Components (Reusable)
│   ├── Menu/                   # Components liên quan đến hiển thị Menu (Book, Card, List)
│   ├── SelectLanguage/         # Component chọn ngôn ngữ (3D Orbit)
│   └── shared/                 # Các component chung (Button, Modal, Input...)
│
├── lib/                        # Libraries & Config (Firebase, Utils)
├── services/                   # Business Logic & API Calls (User Service, Order Service)
└── types/                      # TypeScript Definitions
```

---

## 🗺️ Luồng Người Dùng (User Flow)

Hệ thống được thiết kế theo luồng phân nhánh rõ ràng để cá nhân hóa trải nghiệm khách hàng:

### 1. Màn Hình Chào (Intro)
*   **URL**: `/`
*   **Chức năng**: Hiển thị Logo, hiệu ứng vũ trụ (Galaxy), và cho phép người dùng chọn ngôn ngữ (VN, EN, JP, CN, KR).
*   **Hành động**: Sau khi chọn ngôn ngữ -> Chuyển hướng sang màn hình **Phân Loại Khách**.

### 2. Phân Loại Khách (Customer Type)
*   **URL**: `/[lang]/customer-type`
*   **Chức năng**: Xác định người dùng là khách mới hay khách quen.
*   **Lựa chọn**:
    *   **Khách Hàng Mới**: Chuyển hướng ngay đến trang **Chọn Menu** (`/new-user/select-menu`).
    *   **Khách Hàng Cũ**: Hiển thị **Popup Kiểm Tra Thành Viên**.
        *   *Nhập Email*: Hệ thống check Firebase.
        *   *Có thông tin*: Chuyển đến trang **Lịch Sử** (`/old-user/history`).
        *   *Không có*: Báo lỗi, gợi ý đăng ký mới hoặc nhập lại.

### 3. Chọn Menu (Select Menu) - Dành cho Khách Mới
*   **URL**: `/[lang]/new-user/select-menu`
*   **Giao diện**: Hiển thị 2 cuốn sách 3D đại diện cho 2 hạng dịch vụ:
    *   **Standard**: Ngẫu nhiên nhân viên & phòng (Giá tiêu chuẩn).
    *   **Premium**: Tự chọn thiết kế lộ trình & nhân viên (Giá cao cấp) - *Đang phát triển (Coming Soon)*.

    > **Lưu ý**: Hiện tại chỉ có luồng **Standard** là hoạt động, luồng Premium chưa hoàn thiện.
*   **Hành động**: Chọn sách -> Chuyển đến trang danh sách dịch vụ chi tiết tương ứng.

### 4. Luồng Khách Hàng Cũ (Old User Flow)
*   **URL**: `/[lang]/old-user/history`
*   **Chức năng**: Sau khi check email thành công, khách hàng truy cập trang Lịch Sử và có 3 lựa chọn:
    *   **Rebook**: Đặt lại y nguyên dịch vụ của đơn hàng cũ (Giữ nguyên Staff, Room...).
    *   **Modify**: Sử dụng thông tin đơn cũ nhưng cho phép chỉnh sửa (Đổi giờ, đổi KTV...).
    *   **Create New Booking**: Tạo đơn hàng hoàn toàn mới (Quay lại màn hình **Chọn Menu** để chọn lại Standard/Premium).

---

## 📝 Ghi Chú Phát Triển (Dev Notes)

1.  **Barrel Files**: Các module trong `src/services` hoặc `src/components` nên dùng `index.ts` để export gọn gàng (VD: `import { checkUserEmail } from '@/services/user'`).
2.  **Images**: Ảnh tĩnh (Logo, Menu Cover) nên được lưu trong `public/images/` để tải nhanh và ổn định hơn so với link ngoài.
3.  **Animation**: Sử dụng `tailwind-animate` và CSS Keyframes cho các hiệu ứng chuyển cảnh mượt mà.

---

*© 2024 Ngan Ha Spa Internal System.*