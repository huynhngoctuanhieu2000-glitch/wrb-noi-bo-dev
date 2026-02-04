import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { runTransaction, doc, collection, setDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const DAY_CUTOFF_HOUR = 8; // Reset day at 8:00 AM

// Helper to translate Options to Vietnamese (Hardcoded mapping based on user request)
const toVietnamese = (text: string | null | undefined): string => {
    if (!text) return '';
    const map: Record<string, string> = {
        'light': 'Nhẹ', 'medium': 'Vừa', 'strong': 'Mạnh',
        'male': 'Nam', 'female': 'Nữ', 'random': 'Ngẫu nhiên',
        // Body Parts
        'neck': 'Cổ', 'shoulder': 'Vai', 'back': 'Lưng', 'waist': 'Thắt lưng',
        'arm': 'Tay', 'thigh': 'Đùi', 'calf': 'Bắp chân', 'foot': 'Bàn chân',
        'head': 'Đầu',
        // Tags
        'pregnant': 'Mang thai', 'allergy': 'Dị ứng',
        // Default
        'Medium': 'Vừa', 'Random': 'Ngẫu nhiên'
    };
    // Try exact match case-insensitive
    const lower = text.toLowerCase();
    if (map[lower]) return map[lower];

    // Capitalize first letter if no match
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer, items, paymentMethod, amountPaid, totalVND, lang } = body;

        if (!db) {
            throw new Error("Firebase DB not initialized");
        }

        // 1. Generate Bill Number (Transaction)
        const now = new Date();

        // Convert to VN Time to determine "Business Day"
        // This ensures we work with VN time regardless of Server Region
        const vnDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const currentHour = vnDate.getHours();

        // Determine Business Date
        // If before 8 AM, count as PREVIOUS Day
        const businessDate = new Date(vnDate);
        if (currentHour < DAY_CUTOFF_HOUR) {
            businessDate.setDate(businessDate.getDate() - 1);
        }

        const day = businessDate.getDate().toString().padStart(2, '0');
        const month = (businessDate.getMonth() + 1).toString().padStart(2, '0');
        const year = businessDate.getFullYear();

        const dateCode = `${day}${month}${year}`; // e.g. 03022026
        const dateStrForSheet = `${year}-${month}-${day}`; // e.g. 2026-02-03

        const counterRef = doc(db, 'counters', dateCode);
        let billNum = '';

        await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let nextCount = 1;
            if (counterDoc.exists()) {
                nextCount = counterDoc.data().count + 1;
            }
            transaction.set(counterRef, { count: nextCount }, { merge: true });
            billNum = `${String(nextCount).padStart(2, '0')}-${dateCode}`;
        });

        // 2. Prepare Data Items
        const processedItems = items.map((item: any) => {
            const opts = item.options || {};

            // Map Options to Vietnamese
            const strengthVN = toVietnamese(opts.strength || 'Medium');
            const therapistVN = toVietnamese(opts.therapist || 'Random'); // Note: 'therapist' key from CartItem
            const focusVN = (opts.bodyParts?.focus || []).map((f: string) => toVietnamese(f));
            const avoidVN = (opts.bodyParts?.avoid || []).map((a: string) => toVietnamese(a));

            const tagList = [];
            if (opts.notes?.tag0) tagList.push(toVietnamese('pregnant'));
            if (opts.notes?.tag1) tagList.push(toVietnamese('allergy'));

            // Description Logic
            const staticDescVN = item.names?.vn || item.names?.en || item.name;

            return {
                id: item.id,
                name: item.names?.en || item.name, // English Name
                full_desc: staticDescVN, // Vietnamese Desc
                time: `${item.timeValue}mins`,
                price: item.priceVND,
                qty: item.qty,

                // Vietnamse Options
                strength: strengthVN,
                therapist: therapistVN,
                focus: focusVN,
                avoid: avoidVN,
                tags: tagList,

                note: opts.notes?.content || '',
                full_body: false // Default to false or check logic in future
            };
        });

        // 3. Prepare Final Payload
        // Times
        const totalMinutes = items.reduce((sum: number, i: any) => sum + i.timeValue * i.qty, 0);
        const timeCome = new Date(now.getTime() + 15 * 60000); // 15 mins buffer
        const endTime = new Date(timeCome.getTime() + totalMinutes * 60000);
        const formatTime = (d: Date) => d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');

        // Payment
        const changeDue = amountPaid - totalVND;
        const payName = paymentMethod === 'cash_vnd' ? 'Cash (VND)' :
            paymentMethod === 'cash_usd' ? 'Cash (USD)' : paymentMethod;

        const dataToSend = {
            created_at: now,
            bill_num: billNum,
            date_str: dateStrForSheet,

            cus_name: customer.name || "Guest",
            email: customer.email || "",
            phone: customer.phone || "",
            choosed_lan: (lang || 'en').toUpperCase(),

            // Times
            time_booking: formatTime(timeCome),
            branch: "Ngan Ha Spa",

            // Concatenated Strings
            service: processedItems.map((i: any) => `${i.name} (${i.time})`).join(" | "),
            des_service: processedItems.map((i: any) => i.full_desc).join(" | "),
            items: processedItems,

            // [NEW] Raw Items for Rebook/Modify
            raw_items: items,

            time_come: formatTime(timeCome),
            time_start: formatTime(timeCome),
            time_end: formatTime(endTime),

            payment_method: payName,
            total: `${totalVND.toLocaleString('vi-VN')} VND`,

            // Payment columns
            cash_vnd: paymentMethod === 'cash_vnd' ? String(amountPaid) : "",
            cash_usd: paymentMethod === 'cash_usd' ? String(amountPaid) : "",
            transfer: "", // Todo: handle others
            card: "",

            change_amount_return: changeDue > 0 ? String(changeDue) : "0",
            note: ""
        };

        // 4. Save to Firestore
        await setDoc(doc(db, 'orders', billNum), dataToSend);

        return NextResponse.json({ success: true, billNum });
    } catch (error: any) {
        console.error("API Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        if (!db) {
            throw new Error("Firebase DB not initialized");
        }

        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('email', '==', email)
        );

        const querySnapshot = await getDocs(q);

        const orders: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const totalNum = parseInt((data.total || "0").replace(/\D/g, ''));

            orders.push({
                id: data.bill_num,
                date: data.date_str,
                total: totalNum,
                // Return full item object to get 'id' for restoreCart
                items: (data.items || []).map((i: any) => i),
                raw_items: data.raw_items || [],
                note: data.note || 'None'
            });
        });

        // Sort by id desc (which serves as proxy for date if counters work as expected)
        orders.sort((a, b) => b.id.localeCompare(a.id));

        return NextResponse.json({ success: true, orders });
    } catch (error: any) {
        console.error("API GET Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
