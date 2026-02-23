const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DIRECT_URL);

async function formatTime() {
    const res = await sql`SELECT "createdAt"::text, "createdAt" at time zone 'UTC' as raw_time FROM "Bookings" ORDER BY "createdAt" DESC LIMIT 1`;
    console.log(res);
    process.exit(0);
}

formatTime();
