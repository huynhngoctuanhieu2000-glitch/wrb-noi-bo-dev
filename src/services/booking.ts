import { getMenuData } from "@/services/menu";
import { supabase } from "@/lib/supabase";

// Kiểu dữ liệu cho item trong giỏ hàng gửi lên từ Client
export interface BookingItem {
    id: string;
    qty: number;
    options?: any;
}

export interface BookingRequest {
    customer: {
        name: string;
        phone: string;
        email?: string;
        gender?: string;
    };
    items: BookingItem[];
    paymentMethod: string;
}

/**
 * Tính tổng tiền hóa đơn trên Server.
 */
export const calculateOrderTotal = async (items: BookingItem[]): Promise<{ totalVND: number, detailedItems: any[] }> => {
    const allServices = await getMenuData();

    let totalVND = 0;
    const detailedItems = [];

    for (const item of items) {
        const service = allServices.find(s => s.id === item.id);

        if (service) {
            const lineTotal = service.priceVND * item.qty;
            totalVND += lineTotal;

            detailedItems.push({
                ...item,
                name: service.names.vn,
                priceOriginal: service.priceVND,
                lineTotal
            });
        } else {
            console.warn(`⚠️ Warning: Service ID ${item.id} not found in DB`);
        }
    }

    return { totalVND, detailedItems };
};

/**
 * Tạo đơn hàng mới trong Supabase
 */
export const createBooking = async (data: BookingRequest, calculatedTotal: number) => {
    try {
        // 1. Chèn vào bảng 'bookings'
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                customer_name: data.customer.name,
                customer_phone: data.customer.phone,
                customer_email: data.customer.email,
                customer_gender: data.customer.gender,
                total_amount: calculatedTotal,
                payment_method: data.paymentMethod,
                status: 'pending'
            })
            .select()
            .single();

        if (bookingError) throw bookingError;

        // 2. Chèn các item vào bảng 'booking_items'
        const { detailedItems } = await calculateOrderTotal(data.items);

        const itemsToInsert = detailedItems.map(item => ({
            booking_id: booking.id,
            service_id: item.id,
            quantity: item.qty,
            price_at_booking: item.priceOriginal
        }));

        const { error: itemsError } = await supabase
            .from('booking_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        console.log(`✅ [Booking Service] Created booking ${booking.id} in Supabase`);

        return {
            id: booking.id,
            status: booking.status,
            createdAt: booking.created_at,
            total: calculatedTotal
        };

    } catch (error: any) {
        console.error("❌ [Booking Service] Lỗi tạo đơn hàng:", error.message);
        throw error;
    }
};
