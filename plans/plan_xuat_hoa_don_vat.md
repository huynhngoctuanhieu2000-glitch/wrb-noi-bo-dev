# Plan: Xuất Hoá Đơn VAT (Tax Invoice Lookup)

> **Trạng thái:** ĐÃ DUYỆT  
> **Ngày duyệt:** 2026-06-11  
> **Combo đã chọn:** 1A + 2A + 3A + 4A + 5B

## Các quyết định đã chốt

| # | Quyết định | Lựa chọn |
|---|-----------|----------|
| 1 | Vị trí UI | **A — Trong PaymentModal** |
| 2 | Cấu trúc DB | **A — Chỉ Customers (3 cột)** |
| 3 | Gọi API | **A — Proxy qua Backend** |
| 4 | Phạm vi hiển thị | **A — PaymentModal + OrderConfirm** |
| 5 | Persist data | **B — Nhớ trong session (state ở checkout page)** |

---

## Danh sách file cần tạo/sửa

| Hành động | File | Mô tả |
|-----------|------|-------|
| **NEW** | `src/app/api/tax-lookup/route.ts` | API proxy gọi VietQR |
| **NEW** | `src/components/Checkout/VatInvoiceSection.tsx` | Component checkbox + form MST + kết quả |
| **MODIFY** | `src/components/Checkout/PaymentModal.tsx` | Import VatInvoiceSection, thêm state, truyền vatInvoice qua onNext |
| **MODIFY** | `src/app/[lang]/old-user/[menuType]/checkout/page.tsx` | Thêm state vatInvoice ở page level (5B persist), truyền xuống PaymentModal + OrderConfirm |
| **MODIFY** | `src/components/Checkout/OrderConfirmModal.tsx` | Hiển thị section "Thông tin xuất HĐ" nếu có data |
| **MODIFY** | `src/app/api/orders/route.ts` | Nhận vatInvoice từ body, lưu vào Customers |
| **MODIFY** | `src/lib/dictionaries.ts` | Thêm key `vat_invoice` cho 5 ngôn ngữ |
| **DB** | Supabase `Customers` | ALTER TABLE thêm 3 cột |

---

## Chi tiết kỹ thuật

### 1. Database Migration

```sql
ALTER TABLE "Customers"
ADD COLUMN "taxCode" text,
ADD COLUMN "companyName" text,
ADD COLUMN "companyAddress" text;
```

### 2. API Proxy (`/api/tax-lookup`)

- Method: GET
- Query: `?taxCode=0316794479`
- Gọi: `https://api.vietqr.io/v2/business/{taxCode}`
- Timeout: 5 giây
- Fallback: Trả lỗi graceful nếu VietQR down

### 3. VatInvoiceSection Component

```typescript
interface VatInvoiceData {
  taxCode: string;
  companyName: string;
  companyAddress: string;
}

interface VatInvoiceSectionProps {
  lang: string;
  dict: any;
  invoiceData: VatInvoiceData | null;        // Nhận từ parent (5B persist)
  onInvoiceChange: (data: VatInvoiceData | null) => void;
}
```

### 4. PaymentModal thay đổi

- onNext callback thêm field: `vatInvoice?: VatInvoiceData | null`
- Nhận `initialVatInvoice` prop từ page (5B persist)

### 5. Checkout page (5B persist logic)

- State `vatInvoice` ở page level
- Truyền xuống PaymentModal làm initial value
- Khi PaymentModal onNext → cập nhật state
- Truyền xuống OrderConfirmModal để hiển thị

### 6. i18n keys

```
vat_invoice.checkbox_label
vat_invoice.tax_code_placeholder
vat_invoice.lookup_btn
vat_invoice.looking_up
vat_invoice.company_name
vat_invoice.address
vat_invoice.not_found
vat_invoice.error
vat_invoice.invoice_info_title
```
