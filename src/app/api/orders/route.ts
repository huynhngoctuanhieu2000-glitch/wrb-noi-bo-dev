import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'node:crypto';

const DAY_CUTOFF_HOUR = 8; // Reset day at 8:00 AM

// Helper to translate Options to Vietnamese
const toVietnamese = (text: string | null | undefined): string => {
    if (!text) return '';
    const map: Record<string, string> = {
        'light': 'Nhẹ', 'medium': 'Vừa', 'strong': 'Mạnh',
        'male': 'Nam', 'female': 'Nữ', 'random': 'Ngẫu nhiên',
        'neck': 'Cổ', 'shoulder': 'Vai', 'back': 'Lưng', 'waist': 'Thắt lưng',
        'arm': 'Tay', 'thigh': 'Đùi', 'calf': 'Bắp chân', 'foot': 'Bàn chân',
        'head': 'Đầu', 'pregnant': 'Mang thai', 'allergy': 'Dị ứng',
        'Medium': 'Vừa', 'Random': 'Ngẫu nhiên'
    };
    const lower = text.toLowerCase();
    if (map[lower]) return map[lower];
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer, items, paymentMethod, amountPaid, totalVND, lang } = body;

        const now = new Date();
        const vnDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const currentHour = vnDate.getHours();

        const businessDate = new Date(vnDate);
        if (currentHour < DAY_CUTOFF_HOUR) {
            businessDate.setDate(businessDate.getDate() - 1);
        }

        const day = businessDate.getDate().toString().padStart(2, '0');
        const month = (businessDate.getMonth() + 1).toString().padStart(2, '0');
        const year = businessDate.getFullYear();

        const dateCode = `${day}${month}${year}`;
        const dateStrForSheet = `${year}-${month}-${day}`;

        // 1. Generate Bill Number (Based on today's count in Supabase)
        const { count } = await supabase
            .from('Bookings')
            .select('*', { count: 'exact', head: true })
            .ilike('billCode', `%-${dateCode}`); // Đếm các mã kết thúc bằng chuỗi ngày (ví dụ: -23022026)

        // Tạo chuỗi dạng 001-23022026
        const nextNum = (count || 0) + 1;
        const billNum = `${String(nextNum).padStart(3, '0')}-${dateCode}`;
        const branchCode = '11NDK'; // TODO: Dynamically pass this from frontend later
        const customId = `${branchCode}-${billNum}`;

        // 2. Prepare Data Items
        console.log(`[POST /api/orders] Processing order with status expected: PENDING`);
        const processedItems = items.map((item: any) => {
            const opts = item.options || {};
            const strengthVN = toVietnamese(opts.strength || 'Medium');
            const therapistVN = toVietnamese(opts.therapist || 'Random');
            const focusVN = (opts.bodyParts?.focus || []).map((f: string) => toVietnamese(f));
            const avoidVN = (opts.bodyParts?.avoid || []).map((a: string) => toVietnamese(a));

            const tagList = [];
            if (opts.notes?.tag0) tagList.push(toVietnamese('pregnant'));
            if (opts.notes?.tag1) tagList.push(toVietnamese('allergy'));

            return {
                id: item.id,
                name_en: item.names?.en || item.name,
                name_vn: item.names?.vn || item.name,
                qty: item.qty,
                price: item.priceVND,
                strength: strengthVN,
                therapist: therapistVN,
                focus: focusVN,
                avoid: avoidVN,
                tags: tagList,
                note: opts.notes?.content || ''
            };
        });

        const vnTimeStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

        // 3. Save to Supabase (Bookings)
        const { data: booking, error: bookingError } = await supabase
            .from('Bookings')
            .insert({
                id: customId,
                customerName: customer.name || "Guest",
                customerPhone: customer.phone || "",
                customerEmail: customer.email || "",
                totalAmount: totalVND,
                paymentMethod: paymentMethod,
                createdAt: vnTimeStr,
                updatedAt: vnTimeStr,
                status: 'NEW',
                // Lưu thêm ID cũ vào trường note hoặc 1 trường custom nếu cần thiết cho re-order
                // Tạm thời dùng id_legacy để lưu BillNum
                billCode: billNum
            })
            .select()
            .single();

        if (bookingError) throw bookingError;

        // 4. Save to Supabase (Booking Items)
        const itemsToInsert = processedItems.map((pi: any, index: number) => ({
            id: `${customId}-item${index + 1}`,
            bookingId: customId,
            serviceId: pi.id,
            quantity: pi.qty,
            price: pi.price,
            options: {
                strength: pi.strength,
                therapist: pi.therapist,
                focus: pi.focus,
                avoid: pi.avoid,
                tags: pi.tags,
                note: pi.note
            }
        }));

        const { error: itemsError } = await supabase
            .from('BookingItems')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        return NextResponse.json({ success: true, billNum });
    } catch (error: any) {
        console.error("❌ API Order Error:", error);
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

        // Lấy danh sách booking kèm theo items
        const { data: bookings, error } = await supabase
            .from('Bookings')
            .select(`
                id,
                billCode,
                totalAmount,
                bookingDate,
                BookingItems (
                    id,
                    serviceId,
                    quantity,
                    price,
                    options
                )
            `)
            .eq('customerEmail', email)
            .order('bookingDate', { ascending: false });

        if (error) throw error;

        const result = bookings.map((b: any) => ({
            id: b.billCode || b.id,
            date: new Date(b.bookingDate).toISOString().split('T')[0],
            total: b.totalAmount,
            items: b.BookingItems.map((i: any) => ({
                id: i.serviceId,
                qty: i.quantity,
                price: i.price,
                options: i.options
            })),
            note: 'Supabase Booking'
        }));

        return NextResponse.json({ success: true, orders: result });
    } catch (error: any) {
        console.error("❌ API GET Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
