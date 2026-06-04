# Kế hoạch cập nhật bản dịch đa ngôn ngữ cho VIP Skills

Tài liệu này mô tả kế hoạch cập nhật tên kỹ năng (VIP skills) hiển thị trên giao diện Menu VIP theo bảng dịch 5 ngôn ngữ mới từ khách hàng, đồng thời loại bỏ từ "Body" (chữ body trong Thai, Shiatsu, Oil, Hot Stone, Mix of four...).

## Điểm Cần Lưu Ý & Duyệt Từ User
> [!IMPORTANT]
> **1. Phát hiện lỗi dịch thuật trong tài liệu của bạn:**
> *   Dòng **Mix of four** (Mix 4 loại): Trong bảng của bạn, cột tiếng Nhật (Japanese) đang ghi là `4종 믹스` (đây thực chất là ký tự tiếng Hàn Hangul). Cột tiếng Hàn (Korean) được ghi là `4가지 믹스`.
> *   **Đề xuất:** AI đề xuất điều chỉnh bản dịch tiếng Nhật của **Mix of four** thành `4種ミックス` (hoặc `4in1ミックス`) để đảm bảo tính chính xác cho khách Nhật. Bản dịch tiếng Hàn sẽ giữ nguyên là `4가지 믹스` theo tài liệu.
>
> **2. Cách phân bổ dịch thuật cho nhóm Nail (Cắt móng):**
> *   Trong codebase hiện có 2 ID kỹ năng lẻ liên quan là `nailCombo` (gói combo móng cơ bản) và `nailChuyen` (chuyên móng cao cấp hơn). Khi KTV có `nailChuyen` thì hệ thống sẽ tự động lọc ẩn `nailCombo`.
> *   **Đề xuất mapping:**
>     *   `nailCombo` -> **Nail cut** (Cắt móng / 剪指甲 / 爪切り / 손톱 정리 / Cắt móng)
>     *   `nailChuyen` -> **Manicure & Pedicure** (Cắt móng tay & chân / 手部与足部美甲护理 / ハンド＆フットケア / 매니큐어 & 페디큐어 / Cắt móng tay & chân)
>     *   Cách map này rất hợp lý vì khi KTV có kỹ năng cắt cả móng tay & chân cao cấp (`nailChuyen`), gói cắt móng thường (`nailCombo`) sẽ bị ẩn đi để tránh trùng lặp.
>
> **3. Đối với dịch vụ Lấy ráy tai:**
> *   Có 2 ID trong code: `earCombo` và `earChuyen`. Cả hai đều được map chung về dịch thuật của **Ear Clean** (Lấy ráy tai / 采耳 / 耳掃除 / 귀 청소 / Lấy ráy tai).

## Chi tiết các thay đổi đề xuất trong code

### [MODIFY] [vipSkills.constants.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/Ngan%20Ha/wrb-noi-bo-dev/src/lib/vipSkills.constants.ts)

Cập nhật mảng `LE_SKILLS` và `CHINH_SKILLS` với các bản dịch mới:

#### Nhóm Kỹ Năng Lẻ (LE_SKILLS):
1. **shampoo**:
   *   `vi`: 'Gội đầu thư giãn'
   *   `en`: 'Hair Wash'
   *   `cn`: '舒缓洗发'
   *   `jp`: 'シャンプー'
   *   `kr`: '헤어 워시'
2. **earCombo** & **earChuyen**:
   *   `vi`: 'Lấy ráy tai'
   *   `en`: 'Ear Clean'
   *   `cn`: '采耳'
   *   `jp`: '耳掃除'
   *   `kr`: '귀 청소'
3. **razorShave**:
   *   `vi`: 'Cạo râu (Dao cạo)'
   *   `en`: 'Razor Shave'
   *   `cn`: '剃须刀刮胡'
   *   `jp`: 'カミソリシェービング'
   *   `kr`: '전通 면도' (User ghi `전통 면도` - Traditional Shave) -> `kr`: '전통 면도'
4. **machineShave**:
   *   `vi`: 'Cạo râu (Máy)'
   *   `en`: 'Machine Shave'
   *   `cn`: '电动剃须'
   *   `jp`: '電気シェービング'
   *   `kr`: '전기 면도'
5. **facial**:
   *   `vi`: 'Chăm sóc da mặt'
   *   `en`: 'Facial'
   *   `cn`: '面部护理'
   *   `jp`: 'フェイシャル'
   *   `kr`: '페이셜 케어'
6. **nailCombo** (Cắt móng):
   *   `vi`: 'Cắt móng'
   *   `en`: 'Nail cut'
   *   `cn`: '剪指甲'
   *   `jp`: '爪切り'
   *   `kr`: '손톱 정리'
7. **nailChuyen** (Cắt móng tay & chân):
   *   `vi`: 'Cắt móng tay & chân'
   *   `en`: 'Manicure & Pedicure'
   *   `cn`: '手部与足部美甲护理'
   *   `jp`: 'ハンド＆フットケア'
   *   `kr`: '매니큐어 & 페디큐어'
8. **heelScrub** (Chà gót chân):
   *   `vi`: 'Chà gót chân'
   *   `en`: 'Heel skin shave'
   *   `cn`: '去脚底死皮'
   *   `jp`: 'かかと角質削り'
   *   `kr`: '발뒤꿈치 각질 제거'

#### Nhóm Kỹ Năng Chính (CHINH_SKILLS) - Loại bỏ hoàn toàn chữ "Body":
9. **thaiBody**:
   *   `vi`: 'Thái'
   *   `en`: 'Thai'
   *   `cn`: '泰式'
   *   `jp`: 'タイ古式'
   *   `kr`: '타이'
10. **shiatsuBody**:
    *   `vi`: 'Shiatsu'
    *   `en`: 'Shiatsu'
    *   `cn`: '指压'
    *   `jp`: '指圧'
    *   `kr`: 'シア추'
11. **oilBody**:
    *   `vi`: 'Tinh dầu'
    *   `en`: 'Oil'
    *   `cn`: '精油'
    *   `jp`: 'オイル'
    *   `kr`: '오일'
12. **hotStoneBody**:
    *   `vi`: 'Đá nóng'
    *   `en`: 'Hot Stone'
    *   `cn`: '热石'
    *   `jp`: 'ホットストーン'
    *   `kr`: '핫스톤'
13. **bodyMix**:
    *   `vi`: 'Mix 4 loại'
    *   `en`: 'Mix of four'
    *   `cn`: '四合一综合'
    *   `jp`: '4種ミックス' (Đã sửa lỗi dịch của user từ tiếng Hàn sang tiếng Nhật)
    *   `kr`: '4가지 믹스'
14. **foot**:
    *   `vi`: 'Chân'
    *   `en`: 'Foot'
    *   `cn`: '足部'
    *   `jp`: 'フット'
    *   `kr`: '발'

## Kế hoạch kiểm thử (Verification Plan)
1. **Kiểm tra biên dịch**: Chạy `npm run build` hoặc chạy dev server để đảm bảo không lỗi cú pháp.
2. **Kiểm tra UI hiển thị**:
   *   Chuyển đổi giữa các ngôn ngữ (vi, en, cn, jp, kr) trên giao diện Menu VIP để kiểm tra xem tên các dịch vụ có thay đổi đúng theo bảng trên và không còn chữ "Body" nữa.
