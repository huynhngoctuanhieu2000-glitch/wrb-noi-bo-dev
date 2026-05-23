const postgres = require('postgres');

const databaseUrlReal = "postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(databaseUrlReal, { ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('🔄 Bắt đầu tạo bảng Reminders_Customer và insert dữ liệu...');
  try {
    // 1. Tạo bảng
    await sql`
      CREATE TABLE IF NOT EXISTS "Reminders_Customer" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "contentVN" text NOT NULL,
        "contentEN" text NOT NULL,
        "contentCN" text NOT NULL,
        "contentJP" text NOT NULL,
        "contentKR" text NOT NULL,
        "is_active" boolean DEFAULT true,
        "order_index" integer NOT NULL,
        "created_at" timestamptz DEFAULT now()
      );
    `;
    console.log('✅ Đã tạo/kiểm tra bảng Reminders_Customer.');

    // 2. Xóa dữ liệu cũ nếu chạy lại (tuỳ chọn, để tránh bị trùng lặp)
    await sql`TRUNCATE TABLE "Reminders_Customer"`;

    // 3. Chèn 6 câu hỏi
    const questions = [
      {
        contentEN: "Did the therapist use their personal phone during service?",
        contentVN: "KTV có sử dụng điện thoại cá nhân trong quá trình làm dịch vụ không?",
        contentCN: "理疗师在服务期间是否使用了个人手机？",
        contentJP: "セラピストはサービス中に個人の携帯電話を使用しましたか？",
        contentKR: "테라피스트가 서비스 중 개인 휴대폰을 사용했습니까?",
        order_index: 1
      },
      {
        contentEN: "Did the therapist disturb you during the service?",
        contentVN: "KTV có làm ồn/làm phiền bạn trong quá trình làm dịch vụ không?",
        contentCN: "理疗师在服务期间是否打扰到您？",
        contentJP: "セラピストはサービス中にあなたの邪魔をしましたか？",
        contentKR: "테라피스트가 서비스 중 방해를 했습니까?",
        order_index: 2
      },
      {
        contentEN: "Did the therapist not follow the correct service?",
        contentVN: "KTV có làm sai quy trình dịch vụ không?",
        contentCN: "理疗师是否未按正确的流程提供服务？",
        contentJP: "セラピストは正しいサービス手順に従いませんでしたか？",
        contentKR: "테라피스트가 올바른 서비스 절차를 따르지 않았습니까?",
        order_index: 3
      },
      {
        contentEN: "Did the therapist not gather your belongings in one place?",
        contentVN: "KTV có quên gom đồ đạc của bạn vào một chỗ không?",
        contentCN: "理疗师是否没有将您的物品归置在一处？",
        contentJP: "セラピストはあなたの持ち物を一箇所にまとめませんでしたか？",
        contentKR: "테라피스트가 고객님의 소지품을 한 곳에 모아두지 않았습니까?",
        order_index: 4
      },
      {
        contentEN: "Did the therapist hint or ask for a tip?",
        contentVN: "KTV có gợi ý hoặc đòi tiền tip không?",
        contentCN: "理疗师是否暗示或索要小费？",
        contentJP: "セラピストはチップをほのめかしたり、要求したりしましたか？",
        contentKR: "테라피스트가 팁을 암시하거나 요구했습니까?",
        order_index: 5
      },
      {
        contentEN: "Did the therapist forget to notify you when they started the timer?",
        contentVN: "KTV có quên thông báo cho bạn khi bắt đầu tính giờ không?",
        contentCN: "理疗师是否忘记在开始计时的时候通知您？",
        contentJP: "セラピストはタイマーを開始する際にあなたに知らせるのを忘れましたか？",
        contentKR: "테라피스트가 타이머 시작 시 고객님께 알리는 것을 잊었습니까?",
        order_index: 6
      }
    ];

    for (const q of questions) {
      await sql`
        INSERT INTO "Reminders_Customer" (
          "contentVN", "contentEN", "contentCN", "contentJP", "contentKR", "order_index"
        ) VALUES (
          ${q.contentVN}, ${q.contentEN}, ${q.contentCN}, ${q.contentJP}, ${q.contentKR}, ${q.order_index}
        )
      `;
    }
    console.log('✅ Đã chèn 6 câu hỏi thành công.');

  } catch (error) {
    console.error('❌ Lỗi khi thực thi query:', error);
  } finally {
    await sql.end();
  }
}

main();
