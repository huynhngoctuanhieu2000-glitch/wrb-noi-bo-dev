# Web Nội Bộ Ngân Hà

Hệ thống đặt lịch và quản lý nội bộ cho Ngan Ha Spa, được xây dựng trên Next.js App Router.

## 🚀 Bắt Đầu (Getting Started)

### Yêu cầu (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản 20 trở lên khuyến nghị)
- [npm](https://www.npmjs.com/)

### Cài đặt (Installation)

1. Clone dự án:
   ```bash
   git clone <repository-url>
   cd wrb-noi-bo-dev
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường:
   Tạo file `.env.local` tại thư mục gốc và thêm thông tin cấu hình Firebase của bạn:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Chạy dự án (Running)

Môi trường phát triển (Development):
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

Build cho production:
```bash
npm run build
npm start
```

## 📂 Cấu Trúc Dự Án (Project Structure)

Dự án tuân theo chuẩn `src` của Next.js:

```
src/
├── app/                    # App Router & Logic trang
│   ├── (intro)/            # Intro page (Route Group)
│   ├── [lang]/             # Dynamic Route cho đa ngôn ngữ (vi, en, jp)
│   │   ├── customer-type/  # Chọn loại khách
│   │   ├── new-user/       # Luồng khách mới
│   │   └── old-user/       # Luồng khách cũ
│   └── api/                # Backend API Endpoints
├── components/             # UI Components tái sử dụng
├── lib/                    # Cấu hình & Utility (Firebase, v.v.)
├── services/               # Logic gọi API & Business Logic
├── hooks/                  # Custom React Hooks
└── types/                  # TypeScript Data Types
```

## 🗺️ Luồng Điều Hướng & Routing

Hệ thống sử dụng file-based routing để quản lý luồng người dùng:

1. **Trang Giới Thiệu (Intro)** `(/)`
   - Chọn ngôn ngữ → Redirect tới `/[lang]/customer-type`.

2. **Chọn Loại Khách** `(/[lang]/customer-type)`
   - Phân loại Khách Mới / Khách Cũ.
   - Tích hợp kiểm tra Email thành viên (sử dụng Firebase).

3. **Luồng Khách Mới** `(/[lang]/new-user/...)`
   - Chọn gói dịch vụ (Select Menu) → Chọn món (Menu) → Thanh toán.

4. **Luồng Khách Cũ** `(/[lang]/old-user/...)`
   - Kiểm tra lịch sử (History) → Đặt lịch lại hoặc chọn dịch vụ mới.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore)
- **State/Form**: React Hooks

## 📝 Ghi Chú Phát Triển

- **Routing Đa Ngôn Ngữ**: Mọi route chính đều nằm trong `[lang]` để đảm bảo hỗ trợ i18n.
- **Middleware**: Kiểm soát redirect và validate language param.