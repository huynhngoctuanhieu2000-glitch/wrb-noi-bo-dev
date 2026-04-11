# 🌐 COMMUNICATION STANDARDS
1.  **Language**: 
    - **Conversation/Plans**: Vietnamese (Tiếng Việt) - for clear explanation to the user.
    - **Code/Comments/Commits**: English - for international standards.
2.  **Tone**: Professional, AI Sparring Partner.

# 🚀 WORKFLOW RULES (CRITICAL - NO GLOBAL SEARCH)
1.  **NO AUTO SEARCHING**: Đã vô hiệu hóa việc tự động tìm kiếm (grep search) toàn codebase, không yêu cầu tìm `PROJECT_MAP.md` hoặc `coordination.md` làm chậm máy.
2.  **PLAN FIRST & CHỜ DUYỆT BẮT BUỘC**: Before writing any code, you MUST output a plan in Vietnamese. **You MUST STOP and wait for user's explicit OK/Duyệt before editing files.** 
3.  **HỎI NHƯ PARTNER**: Đặt câu hỏi khai thác yêu cầu thay vì đoán.

# 🔒 MULTI-CONVERSATION COORDINATION (OPTIONAL)

## Rule: File Locking & Coordination
Chỉ áp dụng khi triển khai các tính năng lớn. Nếu chỉ code hoặc fix lỗi thông thường, **hãy bỏ qua quy trình khóa file này** để xử lý tốc độ cao:

1. **READ** the file `.agents/coordination.md` to check which files are currently being edited by other conversations.
2. **If a file is listed as "in-use"** (🟢 Đang làm) by another conversation:
   - DO NOT edit that file.
   - Inform the user: "File [X] đang được conversation khác sửa. Vui lòng đợi hoặc chuyển sang file khác."
3. **Before starting work**, UPDATE `.agents/coordination.md`:
   - Add your conversation description under "Active Conversations"
   - List all files you plan to modify
   - Set status to 🟢 Đang làm
4. **When finishing work**, UPDATE `.agents/coordination.md`:
   - Change your status to 🔴 Xong
   - Or remove your entry entirely

## Example Entry Format
```markdown
### Conversation B - Sửa Admin Dashboard
- **Đang sửa**: `app/admin/dashboard/page.tsx`, `app/admin/dashboard/AdminDashboard.logic.ts`
- **Trạng thái**: 🟢 Đang làm
```

## Important Notes
- This coordination is project-wide and applies to ALL conversations working on this codebase.
- If `.agents/coordination.md` does not exist, create it using the template.
- Always check coordination BEFORE making any file edits, not after.

---

# 📊 DATABASE SCHEMA REFERENCE (CRITICAL)

## Rule: Luôn đọc schema trước khi thay đổi liên quan DB

Khi code có thay đổi liên quan đến **database** (Supabase), bạn **BẮT BUỘC** phải:

1. **ĐỌC** file [`TableInSupabase.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/Quan_Tri_Va_KTV/TableInSupabase.md) **TRƯỚC KHI** viết code.
2. **XÁC NHẬN** tên bảng, tên cột, kiểu dữ liệu, constraints từ file này.
3. **KHÔNG** giả định cột/bảng nào tồn tại — phải kiểm tra trong file trước.

## Khi nào áp dụng rule này?
- Viết / sửa **API routes** có `.from('TableName').select(...)` hoặc `.update(...)` hoặc `.insert(...)`
- Viết / sửa **Supabase migrations** (SQL files)
- Viết / sửa **Supabase triggers / functions**
- Viết / sửa **Realtime subscriptions** (`.on('postgres_changes', ...)`）
- Thêm cột mới → phải tạo migration SQL + cập nhật `TableInSupabase.md`

## Các bảng chính (tóm tắt)
| Nhóm | Bảng |
|------|------|
| Core Booking | `Bookings`, `BookingItems`, `Services` |
| KTV Management | `TurnQueue`, `KTVAttendance`, `Staff` |
| Notification & Config | `StaffNotifications`, `SystemConfigs` |
| Infra & CRM | `Rooms`, `Beds`, `Customers` |
| Auth & Push | `Users`, `StaffPushSubscriptions` |

---

# 📝 KNOWLEDGE & PLAN RETENTION (CRITICAL)

## Rule: Lưu Phân Tích & Kế Hoạch Vào File
1. **Phân tích hướng phát triển (Development Analysis):** Mỗi khi phân tích một hướng đi mới, ưu nhược điểm kỹ thuật hoặc kiến trúc, bạn BẮT BUỘC phải tạo/lưu một Markdown artifact để lưu trữ toàn bộ nội dung phân tích đó.
2. **Kế hoạch triển khai (Implementation Plan):** Khi một bản kế hoạch (plan) được user ĐỒNG Ý / CHẤP NHẬN để tiến hành code, bạn BẮT BUỘC phải lưu lại bản kế hoạch đó vào một file lấy theo **Tên nhiệm vụ** (ví dụ: `plan_tao_api_dat_lich.md`).
3. **Mục đích:** Đảm bảo không bị mất bối cảnh (context) khi chat dài, dễ dàng cho user đọc lại tiến trình làm việc và các quyết định kỹ thuật đã chốt.

## Rule: Project Map & Context (OPTIONAL)
1. **ĐỌC TRƯỚC KHI LÀM:** Không bắt buộc đọc `PROJECT_MAP.md` ở đầu mọi phiên chat. Chỉ tham khảo khi làm tính năng hệ thống hoàn toàn mới để hiểu cấu trúc.
2. **CẬP NHẬT SAU KHI XONG:** Mức bắt buộc chỉ áp dụng với tính năng tốn kém, cấu trúc lớn hoặc database thay đổi vĩ mô. Các chỉnh sửa thông thường thì bỏ qua.
