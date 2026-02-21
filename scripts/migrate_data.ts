/**
 * MIGRATION TOOL: Firebase Firestore -> Supabase PostgreSQL (Direct Connection)
 * 
 * HƯỚNG DẪN:
 * 1. Đã cài đặt thư viện 'postgres' (npm install postgres)
 * 2. Đã cấu hình DIRECT_URL trong .env.local
 * 3. Chạy lệnh: npx ts-node scripts/migrate_data.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env từ .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- CONFIGURATION ---
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
    console.error("❌ Lỗi: Thiếu DIRECT_URL trong file .env.local");
    process.exit(1);
}

// Init Clients
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const sql = postgres(directUrl);

async function migrate() {
    console.log("🚀 Bắt đầu quá trình Migration (Direct Connection)...");

    try {
        // 1. Lấy dữ liệu từ Firestore
        console.log("📥 Đang đọc dữ liệu từ Firebase...");
        const servicesRef = collection(db, "Services");
        const snapshot = await getDocs(servicesRef);

        if (snapshot.empty) {
            console.log("⚠️ Không tìm thấy dữ liệu trong Firebase.");
            return;
        }

        const fbData = snapshot.docs.map(doc => doc.data());
        console.log(`✅ Đã lấy ${fbData.length} dịch vụ.`);

        // 2. Xử lý Categories
        const categoryNames = Array.from(new Set(fbData.map(d => d.CATEGORY))).filter(Boolean) as string[];
        console.log(`📂 Danh mục: ${categoryNames.join(', ')}`);

        const catMap: Record<string, string> = {};

        for (const catName of categoryNames) {
            const [cat] = await sql`
                INSERT INTO "Categories" ("id", "nameVN") 
                VALUES (${catName.toLowerCase().replace(/\s+/g, '-')}, ${catName})
                ON CONFLICT ("nameVN") DO UPDATE SET "nameVN" = EXCLUDED."nameVN"
                RETURNING "id"
            `;
            catMap[catName] = cat.id;
        }
        console.log("✅ Đã xử lý danh mục.");

        // 3. Migrate Services
        console.log("🔄 Đang chuyển đổi Services...");
        let successCount = 0;
        let failCount = 0;

        for (const data of fbData) {
            if (!data.ID) continue;

            try {
                // ... same logic for names/descriptions as before
                const names = {
                    en: data.NAMES?.EN || data.NAMES?.en || "",
                    vn: data.NAMES?.VN || data.NAMES?.vn || "",
                    cn: data.NAMES?.CN || data.NAMES?.cn || null,
                    jp: data.NAMES?.JP || data.NAMES?.jp || null,
                    kr: data.NAMES?.KR || data.NAMES?.kr || null,
                };

                const descriptions = {
                    en: data.DESCRIPTIONS?.EN || data.DESCRIPTIONS?.en || "",
                    vn: data.DESCRIPTIONS?.VN || data.DESCRIPTIONS?.vn || "",
                    cn: data.DESCRIPTIONS?.CN || data.DESCRIPTIONS?.cn || null,
                    jp: data.DESCRIPTIONS?.JP || data.DESCRIPTIONS?.jp || null,
                    kr: data.DESCRIPTIONS?.KR || data.DESCRIPTIONS?.kr || null,
                };

                await sql`
                    INSERT INTO "Services" (
                        "id", "code", "nameVN", "nameEN", "nameCN", "nameJP", "nameKR",
                        "description", "priceVND", "priceUSD", "duration", "imageUrl", 
                        "isActive", "isBestSeller", "isBestChoice", "tags", "focusConfig", "category"
                    ) VALUES (
                        ${data.ID}, 
                        ${data.ID},
                        ${names.vn},
                        ${names.en},
                        ${names.cn},
                        ${names.jp},
                        ${names.kr},
                        ${sql.json(descriptions)}, 
                        ${Number(data.PRICE_VN) || 0}, 
                        ${Number(data.PRICE_USD) || 0}, 
                        ${Number(data.TIME) || 0}, 
                        ${data.IMAGE_URL || null}, 
                        ${data.ACTIVE !== false}, 
                        ${data.BEST_SELLER || false}, 
                        ${data.BEST_CHOICE || false}, 
                        ${data.TAGS ? sql.json(data.TAGS) : null}, 
                        ${data.FOCUS_POSITION ? sql.json(data.FOCUS_POSITION) : null},
                        ${data.CATEGORY || null}
                    )
                    ON CONFLICT ("id") DO UPDATE SET
                        "nameVN" = EXCLUDED."nameVN",
                        "nameEN" = EXCLUDED."nameEN",
                        "nameCN" = EXCLUDED."nameCN",
                        "nameJP" = EXCLUDED."nameJP",
                        "nameKR" = EXCLUDED."nameKR",
                        "description" = EXCLUDED."description",
                        "priceVND" = EXCLUDED."priceVND",
                        "priceUSD" = EXCLUDED."priceUSD",
                        "duration" = EXCLUDED."duration",
                        "imageUrl" = EXCLUDED."imageUrl",
                        "isActive" = EXCLUDED."isActive",
                        "isBestSeller" = EXCLUDED."isBestSeller",
                        "isBestChoice" = EXCLUDED."isBestChoice",
                        "tags" = EXCLUDED."tags",
                        "focusConfig" = EXCLUDED."focusConfig",
                        "category" = EXCLUDED."category"
                `;
                console.log(`   - OK: ${data.ID}`);
                successCount++;
            } catch (err: any) {
                console.error(`   - Lỗi ${data.ID}:`, err.message);
                failCount++;
            }
        }

        console.log("\n======================================");
        console.log("🎉 HOÀN THÀNH MIGRATION!");
        console.log(`✅ Thành công: ${successCount}`);
        console.log(`❌ Thất bại: ${failCount}`);
        console.log("======================================");

    } catch (err) {
        console.error("💥 Lỗi nghiêm trọng:", err);
    } finally {
        await sql.end();
    }
}

migrate();
