import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, customerName, message, type = 'NORMAL' } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('StaffNotifications')
            .insert({
                bookingId,
                type,
                message: message || `Khách hàng ${customerName || 'vô danh'} yêu cầu thêm dịch vụ.`,
                isRead: false,
                createdAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('🚨 [Normal API] Supabase error:', error);
            return NextResponse.json({ 
                error: error.message, 
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, notification: data }, { status: 200 });

    } catch (error: any) {
        console.error('❌ [Normal API] Critical Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
