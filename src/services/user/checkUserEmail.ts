// File: src/services/user/checkUserEmail.ts
import { supabase } from "@/lib/supabase";

export interface CheckUserResult {
    exists: boolean;
    customer: {
        name: string;
        phone: string;
        email: string;
    } | null;
}

export const checkUserEmail = async (email: string): Promise<CheckUserResult> => {
    try {
        // Tìm đơn hàng gần nhất của email này
        const { data, error } = await supabase
            .from('bookings')
            .select('customer_name, customer_phone, customer_email')
            .eq('customer_email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Không tìm thấy dữ liệu
                return { exists: false, customer: null };
            }
            throw error;
        }

        if (data) {
            return {
                exists: true,
                customer: {
                    name: data.customer_name || "",
                    phone: data.customer_phone || "",
                    email: data.customer_email || email
                }
            };
        }

        return { exists: false, customer: null };
    } catch (error) {
        console.error("❌ [Supabase] Lỗi check email:", error);
        return { exists: false, customer: null };
    }
};