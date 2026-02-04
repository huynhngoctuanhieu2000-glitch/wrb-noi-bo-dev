# HƯỚNG DẪN CHỈNH SỬA GIAO DIỆN MENU (DÙNG ĐƠN VỊ PX)

Tài liệu này giúp bạn tự điều chỉnh kích thước, khoảng cách các phần tử trong trang **Chọn Menu** bằng đơn vị **pixel (px)** thay vì **vh**.

---

## 1. Chỉnh Kích Thước & Vị Trí Sách
**File**: `src/components/MenuTypeSelector/style.module.css`

Tìm class `.bookCover` (khoảng dòng 9-10).
Hiện tại đang dùng `vh`. Bạn có thể sửa thành `px` như sau:

```css
.bookCover {
    position: relative;
    /* --- SỬA Ở ĐÂY --- */
    width: 160px;   /* Chiều rộng sách (Ví dụ cũ: 17.25vh) */
    height: 220px;  /* Chiều cao sách (Ví dụ cũ: 23vh) */
    /* ---------------- */
    
    border-radius: 0 0.5rem 0.5rem 0;
    /* ... các thuộc tính khác giữ nguyên ... */
}
```

---

## 2. Chỉnh Khoảng Cách Giữa 2 Sách & Chữ To/Nhỏ
**File**: `src/components/MenuTypeSelector/index.tsx`

### A. Khoảng cách giữa 2 cuốn sách
Tìm thẻ `div` chứa **BOOKS CONTAINER** (khoảng dòng 49).
Sửa `gap-[3vh]` thành px.

```tsx
{/* 2. BOOKS CONTAINER */}
<div className="flex flex-col md:flex-row ... gap-[20px] ..."> 
{/* Sửa gap-[3vh] thành gap-[20px] hoặc gap-[30px] tùy ý */}
```

### B. Kích thước chữ Tiêu Đề (Header)
Tìm phần **1. HEADER** (khoảng dòng 29).

```tsx
{/* Logo Wrapper */}
<div className="h-[100px] ..."> {/* Sửa h-[12vh] thành h-[100px] */}
    {/* ... */}
</div>

{/* Tiêu đề "Select Service Menu" */}
<p className="... text-[20px] ..."> {/* Sửa text-[2.5vh] thành text-[20px] */}
    {t.title}
</p>
```

### C. Chữ trên cuốn sách (Standard / Premium)
Tìm phần hiển thị text trong từng cuốn sách (Standard khoảng dòng 75, Premium khoảng dòng 111).

```tsx
{/* Tên Gói (Standard/Premium) */}
<h3 className="... text-[24px] ..."> {/* Sửa text-[3vh] thành text-[24px] */}
    {t.std}
</h3>

{/* Mô tả (Random Staff...) */}
<p className="... text-[12px] ..."> {/* Sửa text-[1.5vh] thành text-[12px] */}
    {t.std_desc}
</p>
```

---

## 3. Chỉnh Nút Back (Quay lại)
**File**: `src/components/MenuTypeSelector/index.tsx`

Tìm phần **3. NÚT BACK** ở cuối file (khoảng dòng 130).

```tsx
<button
    onClick={onBack}
    // Sửa các thông số sau:
    // text-[14px] : Cỡ chữ
    // py-[12px]   : Độ dày nút (padding trên dưới)
    // px-[40px]   : Độ dài nút (padding trái phải)
    // min-w-[150px]: Chiều dài tối thiểu
    className="... text-[14px] ... py-[12px] px-[40px] min-w-[150px] ..."
>
```

---

## 4. Chỉnh Vị Trí (Margin/Padding)
Nếu muốn đẩy các thành phần ra xa nhau hơn:

*   **Đẩy Logo lên cao hơn**:
    Tìm `mt-[-2vh]` ở thẻ bao quanh Header và sửa thành `mt-[-20px]`.
*   **Đẩy Nút Back xuống thấp/lên cao**:
    Tìm `pb-4` hoặc `pb-2` ở thẻ bao quanh nút Back và sửa thành `pb-[20px]`.

---

### Lưu ý quan trọng
*   Khi sửa thành `px`, bạn nhớ kiểm tra trên điện thoại nhỏ (iPhone SE) xem có bị to quá không nhé.
*   Nếu bị tràn màn hình, hãy giảm số `px` xuống.
