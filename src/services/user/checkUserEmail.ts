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
            .from('Bookings')
            .select('customerName, customerPhone, customerEmail')
            .eq('customerEmail', email)
            .order('bookingDate', { ascending: false })
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
                    name: data.customerName || "",
                    phone: data.customerPhone || "",
                    email: data.customerEmail || email
                }
            };
        }

        return { exists: false, customer: null };
    } catch (error) {
        console.error("❌ [Supabase] Lỗi check email:", error);
        return { exists: false, customer: null };
    }
};