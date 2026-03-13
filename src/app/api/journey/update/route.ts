import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';


export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, status, violations, rating, tipAmount, feedbackNote } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        // Build the update payload dynamically based on what was provided
        const updatePayload: any = {};

        if (status) updatePayload.status = status;
        if (violations !== undefined) updatePayload.violations = violations;
        if (rating !== undefined) updatePayload.rating = rating;
        if (tipAmount !== undefined) updatePayload.tipAmount = tipAmount;
        if (feedbackNote !== undefined) updatePayload.feedbackNote = feedbackNote;

        // Perform the update using the Service Role admin client (bypasses RLS if needed, or enforces secure server-side logic)
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('Bookings')
            .update(updatePayload)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, booking: data }, { status: 200 });

    } catch (error: any) {
        console.error('API Error updating journey:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
