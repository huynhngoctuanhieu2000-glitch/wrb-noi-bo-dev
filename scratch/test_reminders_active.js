const postgres = require('postgres');

const databaseUrlReal = "postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(databaseUrlReal, { ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('🧪 BẮT ĐẦU CHẠY MÔ PHỎNG (PROOF OF CONCEPT) CHO CỜ IS_ACTIVE\n');

  try {
    // 1. Lấy danh sách ban đầu (chỉ lấy câu active)
    let activeReminders = await sql`
      SELECT id, "order_index", "is_active", "contentVN" 
      FROM "Reminders_Customer" 
      WHERE is_active = true
      ORDER BY order_index ASC;
    `;
    console.log(`🟢 LẦN 1: Truy vấn với điều kiện is_active = true`);
    console.log(`👉 Kết quả: Trả về ${activeReminders.length} câu hỏi đang bật.`);
    activeReminders.forEach(r => console.log(`   [Câu ${r.order_index}] Active: ${r.is_active} | ${r.contentVN}`));
    console.log('\n-----------------------------------\n');

    // 2. Lấy ID của câu số 6 và Tắt nó đi (is_active = false)
    const targetId = activeReminders.find(r => r.order_index === 6).id;
    console.log(`🛠️ HÀNH ĐỘNG: Người dùng tắt câu số 6 (Update is_active = false)`);
    await sql`
      UPDATE "Reminders_Customer"
      SET is_active = false
      WHERE id = ${targetId};
    `;
    console.log(`✅ Đã tắt câu hỏi số 6 thành công.\n`);
    console.log('-----------------------------------\n');

    // 3. Truy vấn lại danh sách active
    activeReminders = await sql`
      SELECT id, "order_index", "is_active", "contentVN" 
      FROM "Reminders_Customer" 
      WHERE is_active = true
      ORDER BY order_index ASC;
    `;
    console.log(`🟢 LẦN 2: Truy vấn lại với điều kiện is_active = true`);
    console.log(`👉 Kết quả: Chỉ còn trả về ${activeReminders.length} câu hỏi.`);
    activeReminders.forEach(r => console.log(`   [Câu ${r.order_index}] Active: ${r.is_active} | ${r.contentVN}`));
    console.log('\n-----------------------------------\n');

    // 4. Khôi phục lại trạng thái ban đầu để tránh lỗi dữ liệu cho app
    console.log(`🔄 KHÔI PHỤC: Bật lại câu số 6...`);
    await sql`
      UPDATE "Reminders_Customer"
      SET is_active = true
      WHERE id = ${targetId};
    `;
    console.log(`✅ Đã khôi phục thành công. Kết thúc bài test.`);

  } catch (error) {
    console.error('❌ Lỗi khi thực thi:', error);
  } finally {
    await sql.end();
  }
}

main();
