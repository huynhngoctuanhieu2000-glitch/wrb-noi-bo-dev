# Kế hoạch điều chỉnh thuật ngữ "Massage" thành "Chăm sóc" / "Care"

Theo yêu cầu của bạn, chúng ta sẽ loại bỏ từ "massage" (và các từ tương đương trong ngôn ngữ khác như "마사지", "マッサージ", "按摩") trên toàn bộ hệ thống và thay thế bằng các từ mang ý nghĩa "chăm sóc" / "care" để tạo cảm giác nhẹ nhàng, chuyên nghiệp hơn cho Spa.

## Các thay đổi đề xuất (Đã duyệt: Dùng "Chăm sóc Body")

### 1. `src/components/Menu/constants.ts` (Danh mục chính của Menu)
*   **Body Massage**:
    *   `en`: Body Massage -> **Body Care**
    *   `vi`: Massage Body -> **Chăm sóc Body**
    *   `jp`: ボディマッサージ -> **ボディケア** (Body Care)
    *   `kr`: 전신 마사지 -> **전신 케어** (Full Body Care)
    *   `cn`: 全身按摩 -> **全身护理** (Full Body Care)
*   **Foot Massage**:
    *   `en`: Foot Massage -> **Foot Care**
    *   `vi`: Massage Chân -> **Chăm sóc Chân**
    *   `jp`: 足裏マッサージ -> **フットケア** (Foot Care)
    *   `kr`: 발 마사지 -> **발 케어** (Foot Care)
    *   `cn`: 足部按摩 -> **足部护理** (Foot Care)

### 2. `src/constants/SpaCategories.ts`
*   `label`: { vi: 'Body Massage', en: 'Body Massage' } 
    👉 **Sửa thành:** `{ vi: 'Chăm sóc Body', en: 'Body Care' }`

### 3. `src/components/Menu/Premium/mockData.ts` (Dữ liệu mẫu trang Premium)
*   `vi: 'Chuyên gia Massage Thụy Điển & Đá Nóng'` 👉 **Chuyên gia Chăm sóc Thụy Điển & Đá Nóng**
*   `vi: 'Massage toàn diện & Trị liệu Shiatsu'` 👉 **Chăm sóc toàn diện & Trị liệu Shiatsu**
*   `vi: 'Massage Body'` 👉 **Chăm sóc Body**

### 4. `src/components/Checkout/CustomRequestModal.tsx` & `ServiceOptionSelector.i18n.ts`
*   `Massage Strength` (trong form Checkout) 👉 **Care Pressure** hoặc **Pressure Level**
*   `Massage Pressure` 👉 **Care Pressure**
