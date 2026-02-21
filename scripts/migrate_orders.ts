/**
 * MIGRATION TOOL: Firebase Firestore 'orders' -> Supabase PostgreSQL (Direct)
 * 
 * HƯỚNG DẪN:
 * 1. Chạy sql/upgrade_schema_orders.sql trong Supabase Dashboard
 * 2. npx ts-node scripts/migrate_orders.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'node:crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
    console.error("❌ Thiếu DIRECT_URL");
    process.exit(1);
}

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const sql = postgres(directUrl);

async function migrateOrders() {
    console.log("🚀 Bắt đầu Migrate Orders...");

    try {
        console.log("📥 Đang lấy dữ liệu orders từ Firebase...");
        const ordersRef = collection(db, "orders");
        const snapshot = await getDocs(ordersRef);

        if (snapshot.empty) {
            console.log("⚠️ Không có order nào.");
            return;
        }

        const fbOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ Tìm thấy ${fbOrders.length} orders.`);

        let successCount = 0;
        let failCount = 0;

        for (const fbOrder of fbOrders as any[]) {
            try {
                // 1. Map total & date
                let totalAmount = 0;
                if (typeof fbOrder.total === 'string') {
                    totalAmount = Number(fbOrder.total.replace(/\./g, '').replace(' VND', '')) || 0;
                } else {
                    totalAmount = Number(fbOrder.total) || 0;
                }

                let createdAt = new Date();
                if (fbOrder.created_at) {
                    if (typeof fbOrder.created_at.toDate === 'function') {
                        createdAt = fbOrder.created_at.toDate();
                    } else {
                        createdAt = new Date(fbOrder.created_at);
                    }
                }

                // 2. Xử lý hoặc lấy Customer
                let customerId = null;
                const phone = fbOrder.phone || "";
                if (phone) {
                    const [existingCustomer] = await sql`
                        SELECT id FROM "Customers" WHERE "phone" = ${phone}
                    `;
                    if (existingCustomer) {
                        customerId = existingCustomer.id;
                    } else {
                        const [newCustomer] = await sql`
                            INSERT INTO "Customers" ("id", "fullName", "phone", "email", "gender")
                            VALUES (${crypto.randomUUID()}, ${fbOrder.cus_name || "Guest"}, ${phone}, ${fbOrder.email || ""}, ${fbOrder.gender || null})
                            RETURNING id
                        `;
                        customerId = newCustomer.id;
                    }
                }

                // 3. Chèn vào bảng Bookings (ID là id gốc của Firebase)
                const firebaseId = fbOrder.id;
                const billCode = fbOrder.bill_num || fbOrder.id; // Giữ billCode để hiển thị

                const [booking] = await sql`
                    INSERT INTO "Bookings" (
                        "id", "billCode", "customerName", "customerPhone", "customerEmail", 
                        "totalAmount", "paymentMethod", "status", 
                        "bookingDate", "idLegacy", "customerLang", "notes",
                        "technicianCode", "customerId"
                    ) VALUES (
                        ${firebaseId}, 
                        ${billCode},
                        ${fbOrder.cus_name ?? "Guest"}, 
                        ${phone}, 
                        ${fbOrder.email ?? ""}, 
                        ${totalAmount}, 
                        ${fbOrder.payment_method ?? "Unknown"}, 
                        'DONE', 
                        ${createdAt}, 
                        ${fbOrder.id},
                        ${fbOrder.choosed_lan ?? 'VN'},
                        ${fbOrder.note ?? ""},
                        ${fbOrder.staff_id || fbOrder.ktv || null},
                        ${customerId}
                    )
                    ON CONFLICT ("id") DO NOTHING
                    RETURNING "id"
                `;

                // 4. Chèn BookingItems
                const rawItems = fbOrder.raw_items || fbOrder.items || [];
                if (booking && Array.isArray(rawItems)) {
                    for (const item of rawItems) {
                        const sId = item.id || item.service_id || 'unknown';

                        // Kiểm tra xem serviceId có tồn tại trong bảng Services không
                        const [exists] = await sql`SELECT id FROM "Services" WHERE id = ${sId}`;

                        await sql`
                            INSERT INTO "BookingItems" (
                                "id", "bookingId", "serviceId", "quantity", "price", "options"
                            ) VALUES (
                                ${crypto.randomUUID()},
                                ${booking.id}, 
                                ${exists ? sId : null}, 
                                ${item.qty ?? 1}, 
                                ${Number(item.priceVND || item.price) ?? 0}, 
                                ${sql.json(item.options || {
                            strength: item.strength ?? null,
                            therapist: item.therapist ?? null,
                            focus: item.focus ?? null,
                            avoid: item.avoid ?? null,
                            tags: item.tags ?? null,
                            note: item.note ?? null
                        })}
                            )
                        `;
                    }
                }

                console.log(`   - OK: ${fbOrder.bill_num || fbOrder.id}`);
                successCount++;
            } catch (err: any) {
                console.error(`   - Lỗi ${fbOrder.id}:`, err.message);
                failCount++;
            }
        }

        console.log("\n======================================");
        console.log("🎉 HOÀN THÀNH MIGRATE ORDERS!");
        console.log(`✅ Thành công: ${successCount}`);
        console.log(`❌ Thất bại: ${failCount}`);
        console.log("======================================");

    } catch (err) {
        console.error("💥 Lỗi:", err);
    } finally {
        await sql.end();
    }
}

migrateOrders();
