import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, customerName, message, type = 'EMERGENCY' } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
        }

        /**
         * UPDATED SCHEMA (Based on debug discovery):
         * - id: UUID (PK)
         * - bookingId: TEXT
         * - type: TEXT (e.g. 'EMERGENCY')
         * - message: TEXT
         * - isRead: BOOLEAN
         * - createdAt: TIMESTAMPTZ
         * - employeeId: TEXT (optional)
         * NOTE: 'title' column does not exist.
         */
        const { data, error } = await supabaseAdmin
            .from('StaffNotifications')
            .insert({
                bookingId,
                type,
                message: message || `Khách hàng ${customerName || 'vô danh'} yêu cầu hỗ trợ khẩn cấp tại phòng.`,
                isRead: false,
                createdAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('🚨 [Emergency API] Supabase error:', error);
            return NextResponse.json({ 
                error: error.message, 
                code: error.code,
                details: error.details,
                hint: error.hint 
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, notification: data }, { status: 200 });

    } catch (error: any) {
        console.error('❌ [Emergency API] Critical Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
