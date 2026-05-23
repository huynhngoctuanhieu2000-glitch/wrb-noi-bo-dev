const postgres = require('postgres');

const databaseUrlReal = "postgresql://postgres.adzfohfdindovfcpaizb:KldSnHk8nggpuhpS@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(databaseUrlReal, { ssl: { rejectUnauthorized: false } });

async function main() {
  try {
    const all = await sql`SELECT order_index, is_active, "contentVN" FROM "Reminders_Customer" ORDER BY order_index ASC`;
    console.log(all);
  } catch (e) { console.error(e); } finally { await sql.end(); }
}
main();
