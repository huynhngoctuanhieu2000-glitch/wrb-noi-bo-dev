import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'node:crypto';
import { generateAccessToken } from '@/lib/token';

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
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");
        const body = await request.json();
        const { customer, items, paymentMethod, amountPaid, totalVND, lang } = body;

        // Normalize language code to prevent mismatch (e.g. 'VN' → 'vi', 'vn' → 'vi')
        const VALID_LANGS = ['vi', 'en', 'kr', 'jp', 'cn'];
        const normalizedLang = (() => {
            const raw = (lang || '').toLowerCase().trim();
            return VALID_LANGS.includes(raw) ? raw : 'vi';
        })();
        console.log(`[POST /api/orders] lang from body: "${lang}", normalized: "${normalizedLang}"`);

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
        const { count } = await supabaseAdmin
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

        const vnTimeStr = new Date().toISOString();

        // 2.5 Generate or find Customer ID
        let customerId = customer.id;

        // Try to find existing customer by email OR phone to avoid unique constraint violations
        if (!customerId && (customer.email || customer.phone)) {
            let query = supabaseAdmin.from('Customers').select('id');

            if (customer.email && customer.phone) {
                query = query.or(`email.eq.${customer.email},phone.eq.${customer.phone}`);
            } else if (customer.email) {
                query = query.eq('email', customer.email);
            } else if (customer.phone) {
                query = query.eq('phone', customer.phone);
            }

            const { data: existingCustomer } = await query.limit(1).maybeSingle();

            if (existingCustomer) {
                customerId = existingCustomer.id;
            }
        }

        // If still no ID, create a new one
        if (!customerId) {
            customerId = `CUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        const fallbackId = Date.now().toString();
        const customerData = {
            id: customerId,
            fullName: customer.name || "Guest",
            phone: customer.phone?.trim() || `GUEST-${fallbackId}`,
            email: customer.email?.trim() || `guest-${fallbackId}@no-email.com`,
            createdAt: vnTimeStr,
            updatedAt: vnTimeStr
        };

        const { error: customerError } = await supabaseAdmin
            .from('Customers')
            .upsert(customerData, {
                onConflict: 'id',
                ignoreDuplicates: false
            });

        if (customerError) {
            console.error("⚠️ [API Order] Lỗi lưu thông tin khách hàng (nhưng không lỗi tạo đơn):", customerError);
        }

        // 3. Save to Supabase (Bookings)
        const accessToken = generateAccessToken();
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('Bookings')
            .insert({
                id: customId,
                customerId: customerId,
                customerName: customer.name || "Guest",
                customerPhone: customer.phone || "",
                customerEmail: customer.email || "",
                totalAmount: totalVND,
                paymentMethod: paymentMethod,
                createdAt: vnTimeStr,
                updatedAt: vnTimeStr,
                status: 'NEW',
                billCode: billNum,
                customerLang: normalizedLang,
                accessToken: accessToken
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

        const { error: itemsError } = await supabaseAdmin
            .from('BookingItems')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // Customer upsert logic is handled before Booking insertion.

        return NextResponse.json({ success: true, billNum, bookingId: customId, accessToken });
    } catch (error: any) {
        console.error("❌ API Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const phone = searchParams.get('phone');

        if (!email && !phone) {
            return NextResponse.json({ success: false, error: 'Email or phone required' }, { status: 400 });
        }

        // Build query with email OR phone
        let query = supabaseAdmin
            .from('Bookings')
            .select(`
                id,
                billCode,
                totalAmount,
                bookingDate,
                status,
                rating,
                technicianCode,
                accessToken,
                BookingItems!BookingItems_bookingId_fkey (
                    id,
                    serviceId,
                    quantity,
                    price,
                    options
                )
            `);

        if (email && phone) {
            query = query.or(`customerEmail.eq.${email},customerPhone.eq.${phone}`);
        } else if (email) {
            query = query.eq('customerEmail', email);
        } else if (phone) {
            query = query.eq('customerPhone', phone);
        }

        const { data: bookings, error } = await query
            .order('bookingDate', { ascending: false });

        if (error) throw error;

        // Fetch all services to map names
        const { data: allServices } = await supabaseAdmin
            .from('Services')
            .select('id, nameVN, nameEN, duration')
            .limit(1000);

        const svcMap = new Map();
        if (allServices) {
            allServices.forEach((s: any) => {
                if (s.id) svcMap.set(String(s.id).trim().toLowerCase(), s);
            });
        }

        // Fetch staff names for technicianCodes
        const techCodes = [...new Set(bookings.map((b: any) => b.technicianCode).filter(Boolean))];
        const staffMap = new Map<string, string>();
        if (techCodes.length > 0) {
            const { data: staffList } = await supabaseAdmin
                .from('Staff')
                .select('id, fullName')
                .in('id', techCodes);

            if (staffList) {
                staffList.forEach((s: any) => {
                    if (s.id) staffMap.set(s.id, s.fullName || s.id);
                });
            }
        }

        const result = bookings.map((b: any) => ({
            id: b.id,
            date: new Date(b.bookingDate).toISOString().split('T')[0],
            total: b.totalAmount,
            status: b.status,
            rating: b.rating,
            technicianCode: b.technicianCode || null,
            staffName: b.technicianCode ? (staffMap.get(b.technicianCode) || b.technicianCode) : null,
            items: b.BookingItems.map((i: any) => {
                const sId = String(i.serviceId || '').trim().toLowerCase();
                const svc = svcMap.get(sId);
                return {
                    id: i.serviceId,
                    name: svc?.nameVN || svc?.nameEN || `Dịch vụ ${i.serviceId}`,
                    duration: svc?.duration || null,
                    qty: i.quantity,
                    price: i.price,
                    options: i.options
                };
            }),
            note: 'Supabase Booking',
            accessToken: b.accessToken || null
        }));

        return NextResponse.json({ success: true, orders: result });
    } catch (error: any) {
        console.error("❌ API GET Order Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
