# Kế hoạch triển khai: Thêm nút dịch Tiếng Việt tại trang Checkout (VIP Menu)

## 📌 Mục tiêu
Bổ sung một nút bấm nhỏ ở góc trên bên phải màn hình Checkout (`ConfirmationScreen`) để Lễ tân/Quản lý có thể chuyển đổi nhanh toàn bộ thông tin đơn hàng sang Tiếng Việt (hoặc ngược lại) khi khách đang thao tác bằng ngôn ngữ khác (Hàn, Trung, Nhật, Anh). Thiết kế nút cực kỳ nhỏ gọn, tinh tế và tiệp màu nền để tránh việc khách hàng ấn nhầm.

---

## 🛠️ Chi tiết các thay đổi đề xuất

### Component thay đổi: [ConfirmationScreen/index.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/components/Menu/Premium/ConfirmationScreen/index.tsx)

1. **Bổ sung State và Effect quản lý ngôn ngữ hiển thị**:
   - Thêm state `activeLang` để quyết định ngôn ngữ hiển thị trên giao diện (khởi tạo bằng prop `lang`).
   - Thêm state `originalLang` để lưu lại ngôn ngữ gốc của khách (khởi tạo bằng prop `lang`).
   - Thêm một `useEffect` để đồng bộ `activeLang` và `originalLang` khi prop `lang` từ component cha thay đổi.
   ```typescript
   const [activeLang, setActiveLang] = useState(lang);
   const [originalLang, setOriginalLang] = useState(lang);

   useEffect(() => {
     setActiveLang(lang);
     setOriginalLang(lang);
   }, [lang]);
   ```

2. **Cập nhật Logic dịch thuật**:
   - Đổi `const t = i18n[lang]` thành `const t = i18n[activeLang]`.
   - Đổi định dạng ngày `toLocaleDateString` dùng `activeLang` thay thế cho `lang`.
   - Giữ nguyên prop `lang` (ngôn ngữ gốc của khách) khi gửi dữ liệu lên API `/api/booking/vip-appointment` để bảo đảm hệ thống gửi thông báo/xác nhận đúng ngôn ngữ của khách hàng.

3. **Bổ sung nút dịch Tiếng Việt (Thiết kế nhỏ gọn ẩn ở góc phải Banner)**:
   - Thêm một nút bấm tuyệt đối (`absolute top-3 right-3 z-50`) trên Hero Banner của trang Checkout.
   - **Tối ưu chống ấn nhầm**:
     - Nút có kích thước nhỏ gọn (`px-2 py-1` với font chữ siêu nhỏ `text-[9px]`).
     - Sử dụng màu nền tối tiệp màu với banner (`bg-[#131315]/40` kết hợp border mờ `#4d463a]/20`), không dùng màu sáng hay màu nhấn nổi bật để khách không chú ý tới, hạn chế tối đa việc khách click nhầm.
     - Khi Lễ tân cần kiểm tra, chỉ cần click vào góc phải trên cùng của Banner để chuyển dịch.
   ```tsx
   <div className="absolute top-3 right-3 z-50">
     <button
       type="button"
       onClick={() => {
         if (activeLang === 'vi') {
           setActiveLang(originalLang);
         } else {
           setActiveLang('vi');
         }
       }}
       className="bg-[#131315]/40 hover:bg-[#1b1b1d]/80 text-[#e6c487]/70 hover:text-[#e6c487] text-[9px] font-black tracking-widest uppercase px-2.5 py-1.5 rounded-lg border border-[#4d463a]/20 shadow-sm active:scale-95 transition-all flex items-center gap-1"
     >
       🌐 {activeLang === 'vi' ? `ORIGINAL (${originalLang.toUpperCase()})` : 'DỊCH TIẾNG VIỆT'}
     </button>
   </div>
   ```

---

## 🧪 Kế hoạch kiểm thử (Verification Plan)

1. **Kiểm tra giao diện & Chuyển đổi ngôn ngữ**:
   - Truy cập vào trang Checkout với ngôn ngữ khác (ví dụ: `lang = 'kr'` hoặc `lang = 'en'`).
   - Xác nhận nút **"🌐 DỊCH TIẾNG VIỆT"** hiển thị nhỏ gọn, tiệp màu nền ở góc phải của Banner.
   - Bấm nút: Xác nhận toàn bộ giao diện đổi sang Tiếng Việt. Nút đổi tên thành **"🌐 ORIGINAL (KR)"** hoặc **"🌐 ORIGINAL (EN)"**.
   - Bấm lại: Giao diện chuyển lại thành ngôn ngữ gốc.
2. **Kiểm tra Gửi Đặt Lịch**:
   - Điền thông tin và bấm gửi đơn đặt lịch.
   - Xác nhận API nhận được đúng ngôn ngữ gốc của khách (`lang` gốc của prop) để lưu xuống DB và bắn Telegram chuẩn.
3. **Biên dịch**:
   - Chạy build dự án `wrb-noi-bo-dev` để bảo đảm không có bất kỳ lỗi TypeScript hay lỗi biên dịch nào.
