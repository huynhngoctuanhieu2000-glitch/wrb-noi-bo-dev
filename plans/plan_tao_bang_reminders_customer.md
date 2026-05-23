# Kế Hoạch Tạo Bảng `Reminders_Customer` 

Mục tiêu: Tạo bảng `Reminders_Customer` trên Supabase để lưu trữ 6 câu hỏi feedback của khách hàng sau khi dùng dịch vụ (như trong ảnh), hỗ trợ 5 ngôn ngữ (VN, EN, CN, JP, KR).

## 1. Cấu trúc bảng `Reminders_Customer` đề xuất

Sẽ tạo bảng mới với các cột giống định dạng đa ngôn ngữ của các bảng hiện tại:

- `id`: `uuid` (Primary Key)
- `contentVN`: `text` (Câu hỏi tiếng Việt)
- `contentEN`: `text` (Câu hỏi tiếng Anh)
- `contentCN`: `text` (Câu hỏi tiếng Trung)
- `contentJP`: `text` (Câu hỏi tiếng Nhật)
- `contentKR`: `text` (Câu hỏi tiếng Hàn)
- `is_active`: `boolean` (Trạng thái hiển thị, mặc định `true`)
- `order_index`: `integer` (Thứ tự hiển thị)
- `created_at`: `timestamptz` (Thời gian tạo)

## 2. Danh sách 6 câu hỏi dịch (5 ngôn ngữ)

**Câu 1:**
- EN: Did the therapist use their personal phone during service?
- VN: KTV có sử dụng điện thoại cá nhân trong quá trình làm dịch vụ không?
- CN: 理疗师在服务期间是否使用了个人手机？
- JP: セラピストはサービス中に個人の携帯電話を使用しましたか？
- KR: 테라피스트가 서비스 중 개인 휴대폰을 사용했습니까?

**Câu 2:**
- EN: Did the therapist disturb you during the service?
- VN: KTV có làm ồn/làm phiền bạn trong quá trình làm dịch vụ không?
- CN: 理疗师在服务期间是否打扰到您？
- JP: セラピストはサービス中にあなたの邪魔をしましたか？
- KR: 테라피스트가 서비스 중 방해를 했습니까?

**Câu 3:**
- EN: Did the therapist not follow the correct service?
- VN: KTV có làm sai quy trình dịch vụ không?
- CN: 理疗师是否未按正确的流程提供服务？
- JP: セラピストは正しいサービス手順に従いませんでしたか？
- KR: 테라피스트가 올바른 서비스 절차를 따르지 않았습니까?

**Câu 4:**
- EN: Did the therapist not gather your belongings in one place?
- VN: KTV có quên gom đồ đạc của bạn vào một chỗ không?
- CN: 理疗师是否没有将您的物品归置在一处？
- JP: セラピストはあなたの持ち物を一箇所にまとめませんでしたか？
- KR: 테라피스트가 고객님의 소지품을 한 곳에 모아두지 않았습니까?

**Câu 5:**
- EN: Did the therapist hint or ask for a tip?
- VN: KTV có gợi ý hoặc đòi tiền tip không?
- CN: 理疗师是否暗示或索要小费？
- JP: セラピストはチップをほのめかしたり、要求したりしましたか？
- KR: 테라피스트가 팁을 암시하거나 요구했습니까?

**Câu 6:**
- EN: Did the therapist forget to notify you when they started the timer?
- VN: KTV có quên thông báo cho bạn khi bắt đầu tính giờ không?
- CN: 理疗师是否忘记在开始计时的时候通知您？
- JP: セラピストはタイマーを開始する際にあなたに知らせるのを忘れましたか？
- KR: 테라피스트가 타이머 시작 시 고객님께 알리는 것을 잊었습니까?

## 3. Các bước thực hiện (Sau khi duyệt)

1. Viết script SQL (hoặc Javascript Supabase client) để tạo bảng `Reminders_Customer` trực tiếp trên Supabase.
2. Viết script `INSERT` 6 câu hỏi với bản dịch trên vào bảng vừa tạo.
3. Chạy script để đưa dữ liệu lên.
4. Cập nhật tài liệu `TableInSupabase.md` để ghi nhận cấu trúc bảng `Reminders_Customer` cho các AI agent sau này.
