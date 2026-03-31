import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, customerName, message, type = 'NORMAL' } = body;

        console.log('[Normal API] Received payload:', { bookingId, customerName, type });

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error('[Normal API] supabaseAdmin is null — SUPABASE_SERVICE_ROLE_KEY missing?');
            return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
        }

        const insertPayload = {
            bookingId,
            // ✅ Dùng type hợp lệ theo schema DB
            // type param từ caller có thể là 'NORMAL' → ghi đè thành 'ADD_SERVICE'
            type: type === 'NORMAL' ? 'ADD_SERVICE' : type,
            message: message || `Khách hàng ${customerName || 'vô danh'} yêu cầu thêm dịch vụ.`,
            isRead: false,
            createdAt: new Date().toISOString(), // Cột này tồn tại trong bảng
        };

        console.log('[Normal API] Inserting into StaffNotifications:', insertPayload);

        const { data, error } = await supabaseAdmin
            .from('StaffNotifications')
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            // Log FULL error object để dễ debug trên Vercel Function Logs
            console.error('🚨 [Normal API] Supabase INSERT error:', JSON.stringify(error, null, 2));
            return NextResponse.json({
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            }, { status: 500 });
        }

        console.log('[Normal API] ✅ Inserted successfully:', data?.id);
        return NextResponse.json({ success: true, notification: data }, { status: 200 });

    } catch (error: any) {
        console.error('❌ [Normal API] Critical Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
