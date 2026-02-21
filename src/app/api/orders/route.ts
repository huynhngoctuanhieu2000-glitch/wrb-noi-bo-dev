import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
        // Note: For high concurrency, use a database function (RPC)
        const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .ilike('id_legacy', `%-UI-${dateCode}`); // Giả định ID legacy có dateCode

        // Do chúng ta dùng UUID cho Supabase, ta dùng trường custom để chứa BillNum
        const nextNum = (count || 0) + 1;
        const billNum = `${String(nextNum).padStart(2, '0')}-${dateCode}`;

        // 2. Prepare Data Items
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

        // 3. Save to Supabase (Bookings)
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                customer_name: customer.name || "Guest",
                customer_phone: customer.phone || "",
                customer_email: customer.email || "",
                customer_gender: customer.gender || "Other",
                total_amount: totalVND,
                payment_method: paymentMethod,
                status: 'pending',
                // Lưu thêm ID cũ vào trường note hoặc 1 trường custom nếu cần thiết cho re-order
                // Tạm thời dùng id_legacy để lưu BillNum
                id_legacy: billNum
            })
            .select()
            .single();

        if (bookingError) throw bookingError;

        // 4. Save to Supabase (Booking Items)
        const itemsToInsert = processedItems.map((pi: any) => ({
            booking_id: booking.id,
            service_id: pi.id,
            quantity: pi.qty,
            price_at_booking: pi.price,
            options_snapshot: {
                strength: pi.strength,
                therapist: pi.therapist,
                focus: pi.focus,
                avoid: pi.avoid,
                tags: pi.tags,
                note: pi.note
            }
        }));

        const { error: itemsError } = await supabase
            .from('booking_items')
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
            .from('bookings')
            .select(`
                id,
                id_legacy,
                total_amount,
                created_at,
                booking_items (
                    id,
                    service_id,
                    quantity,
                    price_at_booking,
                    options_snapshot
                )
            `)
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const result = bookings.map((b: any) => ({
            id: b.id_legacy || b.id,
            date: new Date(b.created_at).toISOString().split('T')[0],
            total: b.total_amount,
            items: b.booking_items.map((i: any) => ({
                id: i.service_id,
                qty: i.quantity,
                price: i.price_at_booking,
                options: i.options_snapshot
            })),
            note: 'Supabase Booking'
        }));

        return NextResponse.json({ success: true, orders: result });
    } catch (error: any) {
        console.error("❌ API GET Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
