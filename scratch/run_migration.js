const postgres = require('postgres');

const databaseUrl = "postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('🔄 Bắt đầu chạy SQL migration chèn config...');
  try {
    await sql`
      INSERT INTO "SystemConfigs" (key, value)
      VALUES ('menu_vip_buffer_minutes', '30')
      ON CONFLICT (key) DO NOTHING;
    `;
    console.log('✅ Đã chèn thành công key "menu_vip_buffer_minutes" = "30" vào bảng SystemConfigs.');
  } catch (error) {
    console.error('❌ Lỗi khi thực thi SQL Migration:', error);
  } finally {
    await sql.end();
  }
}

main();
