const postgres = require('postgres');

const databaseUrl = "postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.southeast.1.pooler.supabase.com:6543/postgres?pgbouncer=true";
// Sửa lại host cho chuẩn (bỏ bớt pooler.southeast.1 nếu gõ sai, cơ mà cứ lấy link cũ đã dùng được là:
// postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
const databaseUrlReal = "postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(databaseUrlReal, { ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('🔄 Bắt đầu query Services...');
  try {
    const services = await sql`
      SELECT id, "nameVN", category, "priceVND", "isActive" FROM "Services";
    `;
    console.log('--- SERVICES LIST ---');
    services.forEach(s => {
      console.log(`ID: ${s.id} | Name: ${s.nameVN} | Category: ${s.category} | Price: ${s.priceVND} | Active: ${s.isActive}`);
    });
  } catch (error) {
    console.error('❌ Lỗi khi thực thi query:', error);
  } finally {
    await sql.end();
  }
}

main();
