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

        // Tạo thông báo cho nhân viên
        const { data, error } = await supabaseAdmin
            .from('StaffNotifications')
            .insert({
                bookingId,
                title: type === 'EMERGENCY' ? '🚨 YÊU CẦU KHẨN CẤP' : 'Thông báo mới',
                message: message || `Khách hàng ${customerName || 'vô danh'} yêu cầu hỗ trợ khẩn cấp tại phòng.`,
                type,
                status: 'UNREAD',
                createdAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase notification insert error:', error);
            // Nếu bảng StaffNotifications chưa tồn tại, ta có thể log lỗi nhưng vẫn trả về success giả định nếu muốn flow không gãy
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, notification: data }, { status: 200 });

    } catch (error: any) {
        console.error('API Error sending emergency notification:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
