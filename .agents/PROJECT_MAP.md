# 🗺️ BẢN ĐỒ DỰ ÁN (PROJECT MAP) - WRB-NOI-BO-DEV

*Mục đích: Cung cấp ngữ cảnh (context) tổng quan về kiến trúc mã nguồn và luồng dữ liệu của ứng dụng Ngân Hà Spa WebBooking.*
*(Sẽ được cập nhật liên tục bởi AI sau khi hoàn thành các tính năng lớn).*

## 1. 📂 CẤU TRÚC THƯ MỤC CỐT LÕI (ROOT DIRECTORY)
Dự án sử dụng **Next.js App Router**:

```text
src/
├── app/               # Định tuyến Next.js (App Router)
│   ├── [lang]/        # Xử lý đa ngôn ngữ (I18N param), chứa các màn hình chính (Customer Type, Booking)
│   ├── api/           # Backend Next API Routes
│   ├── auth/          # Xử lý đăng nhập / xác thực
│   ├── layout.tsx     # Root Layout tổng
│   └── middleware.ts  # Middleware xử lý route (I18N, Auth, etc.)
├── components/        # Chứa hệ thống UI Components (Client/Server)
│   ├── Checkout/      # Luồng thanh toán, Invoice, Thông tin khách hàng cuối
│   ├── CustomForYou/  # Luồng Booking "Tùy chỉnh" (Spa Booking Flow truyền thống)
│   ├── Journey/       # Luồng Service "Hành trình" (Dành cho Relax/Trị Liệu)
│   ├── Menu/          # Luồng Hiển thị Menu (gồm Premium VIP Booking Flow)
│   ├── ServiceRoom/   # Luồng quản lý phòng dịch vụ
│   └── Shared/        # Components dùng lại (Button, Header, Modal, Form Elements...)
├── lib/               # Các thư viện Core (Supabase Client, Format logic, Helpers...)
├── constants/         # Các config tĩnh, hằng số (UI Config, Giá trị giới hạn)
└── services/          # Các tầng giao tiếp DB, call API để fetch dữ liệu 
```

## 2. 🏗️ KIẾN TRÚC COMPONENT CHUẨN (PATTERN STRICT)
Dự án được xây dựng và tuân thủ nguyên tắc **Separation of Concerns (SoC)** phân tách hoàn toàn giữa Code UI và Business Logic:

Mỗi một thư mục Component thực tế sẽ gồm nhóm file chuẩn:
1. `ComponentName.tsx`: **(UI View Layer)** Dành riêng để render UI (JSX + Tailwind). Gọi hàm logic từ hook.
2. `ComponentName.logic.ts`: **(Business Layer)** Hook custom để quản lý `useState`, `useEffect`, fetch API.
3. `ComponentName.i18n.ts`: **(Dictionary Layer)** File chứa bản dịch text đa ngôn ngữ. Tuyệt đối không hardcode chữ ở file UI `.tsx`.
4. `ComponentName.animation.ts`: (Optional) Tách các configs về Framer Motion, GSAP.

## 3. 🔄 THEO DÕI CÁC LUỒNG TÍNH NĂNG CHÍNH (FEATURE LOGS)
*(Phần này sẽ được AI cập nhật bổ sung sau khi xây dựng xong các mảng lớn của WebBooking)*

### 3.1. Luồng VIP Booking Flow (Premium Menu) - Mới nhất
- Nằm chủ yếu ở thư mục: `src/components/Menu/Premium`
- Hoạt động dựa trên state-machine: Intent -> Chọn KTV -> Booking Config -> Confirmation.
- Liên kết với: `scripts/check_data.ts` (các cấu trúc dữ liệu mô phỏng).
- Chi tiết logic nghiệp vụ xem tại: `_plans/vip_flow_analysis.md` và `_plans/plan_chon_skill_nhieu_ktv.md`.

---
**💡 Hướng dẫn cho AI/Dev:**
> *Trước khi xử lý sửa lỗi liên quan đến Flow hoặc Router, BẮT BUỘC đọc file Bản đồ này. Nếu vừa đẩy (push) một cập nhật logic lớn vào repo, AI phải chủ động tóm tắt Data Flow của Flow mới và thêm vào mục số 3 của file MAP này.*
