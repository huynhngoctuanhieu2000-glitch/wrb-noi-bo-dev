const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres(process.env.DIRECT_URL);

async function checkData() {
    try {
        console.log("Fetching latest booking...");
        // Lấy 1 đơn hàng mới nhất
        const latestBooking = await sql`
            SELECT * FROM "Bookings"
            ORDER BY "createdAt" DESC
            LIMIT 1
        `;

        if (latestBooking.length === 0) {
            console.log("No bookings found in DB.");
            process.exit(0);
        }

        console.log("\n=== LATEST BOOKING ===");
        console.log(latestBooking[0]);

        const bookingId = latestBooking[0].id;

        console.log(`\nFetching items for booking ${bookingId}...`);
        const items = await sql`
            SELECT * FROM "BookingItems"
            WHERE "bookingId" = ${bookingId}
        `;

        console.log("\n=== BOOKING ITEMS ===");
        console.log(items);

    } catch (error) {
        console.error("Error querying DB:", error);
    } finally {
        process.exit(0);
    }
}

checkData();
