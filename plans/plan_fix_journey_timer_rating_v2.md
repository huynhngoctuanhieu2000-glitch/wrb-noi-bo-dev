# Plan: Fix Customer Journey — Timer Kẹt 00:00 & Không Chuyển Được Trang Đánh Giá (Revised)

## 📋 Bối cảnh

Hệ thống quản trị (`Quan_Tri_Va_KTV`) đã chuyển sang flow: `IN_PROGRESS` -> `CLEANING` -> `DONE`.
Trang khách hàng (`wrb-noi-bo-dev`) cần đồng bộ để nhận diện `CLEANING` là trạng thái kết thúc phục vụ để chuyển sang bước "Kiểm tra đồ" và "Đánh giá".

### Triệu chứng
- Khách bị kẹt ở màn hình Timer hiện **00:00** dù KTV đã xong việc.
- Không tự chuyển sang trang "Kiểm tra đồ".

---

## 🔍 Phân tích & Phản biện (AI Sparring)

### 1. Phân tách Fix Bug vs Hardening (User Feedback)
- **Fix chính**: Cho phép `CLEANING` kích hoạt `allCompleted` và render đúng view.
- **Hardening/Backward Compatibility**: Normalize `COMPLETED` (cũ) thành `CLEANING` (mới) và xử lý `FEEDBACK`.

### 2. Xác minh Item-level Status
- Theo code hiện tại (`api/journey/update`), `BookingItems` nhảy từ `CLEANING` (do backend/KTV set) sang `DONE` (khi khách đánh giá xong).
- **Không có** trạng thái `FEEDBACK` ở cấp độ Item. Trạng thái `FEEDBACK` chỉ tồn tại ở cấp độ Booking (`Bookings.status`) sau khi khách xác nhận "Kiểm tra đồ".
- => Việc check `FEEDBACK` ở `allCompleted` (item level) là không hại nhưng không phải là flow chính của item. Tuy nhiên, ta vẫn giữ để bao quát trường hợp dữ liệu bị set thủ công.

---

## 🔧 Kế hoạch triển khai (Mandatory Steps)

### Bước 1: Cập nhật Type Definition (Mandatory)
**File:** `src/components/Journey/useJourneyRealtime.ts`
- Cập nhật `JourneyStatus` để bao gồm `CLEANING`.

```typescript
// Dòng 4
export type JourneyStatus = 'NEW' | 'PREPARING' | 'IN_PROGRESS' | 'CLEANING' | 'COMPLETED' | 'FEEDBACK' | 'DONE';
```

### Bước 2: Fix Logic Chuyển Trang (Fix Bug)
**File:** `src/components/Journey/ServiceList.tsx`
- Đảm bảo `allCompleted` bao gồm `CLEANING` và `FEEDBACK`. (Verify logic line 601)

**File:** `src/components/Journey/Journey.logic.ts`
- Đảm bảo `doneStatuses` bao gồm `CLEANING` và `FEEDBACK`. (Verify logic line 194)

### Bước 3: State Machine Normalize & Render (Fix & Hardening)
**File:** `src/app/[lang]/journey/[bookingId]/page.tsx`

- **Fix**: Cho phép render `ServiceList` khi booking status là `CLEANING`.
- **Hardening**: Map `COMPLETED` -> `CLEANING` để xử lý dữ liệu cũ.

```typescript
// Normalize (Hardening) - Dòng 36
const derivedStatusRaw = ...
    : rawStatus === 'COMPLETED' ? 'CLEANING' 
    : rawStatus;

// State logic (Fix) - Dòng 99 & 358
// Đảm bảo CLEANING nằm trong danh sách các trạng thái hiển thị ServiceList
```

---

## 📝 Danh sách file thay đổi
1. `src/components/Journey/useJourneyRealtime.ts`: Cập nhật type `JourneyStatus`.
2. `src/app/[lang]/journey/[bookingId]/page.tsx`: Kiểm tra và tinh chỉnh logic normalize/render.
3. `src/components/Journey/ServiceList.tsx`: Verify logic `allCompleted`.
4. `src/components/Journey/Journey.logic.ts`: Verify logic `doneStatuses`.

---

## 🧪 Kế hoạch kiểm thử (Test Plan)

1. **Test Auto-transition**: Giả lập `BookingItems` chuyển sang `CLEANING` -> Kiểm tra `ServiceList` có tự nhảy sang `CheckBelongingsView` không.
2. **Test Timer UI**: Khi item là `CLEANING`, vòng tròn timer phải hiện ✅.
3. **Test Backward Compatibility**: Đổi status booking thủ công thành `COMPLETED` trong DB -> Kiểm tra trang vẫn hoạt động bình thường (được normalize về `CLEANING`).

---

**AI Remind**: Sau khi cập nhật type, cần đảm bảo không có lỗi TypeScript ở các file sử dụng `JourneyStatus`.
