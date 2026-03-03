import { createClient } from '@supabase/supabase-js';

/**
 * Supabase admin client for use in SERVER ENVIRONMENTS ONLY (e.g., Next.js API Routes).
 * This bypasses Row Level Security (RLS) policies.
 */
export const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('❌ LỖI NGHIÊM TRỌNG: Bạn chưa khai báo SUPABASE_SERVICE_ROLE_KEY trong file .env.local!');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
};
