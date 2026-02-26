import { getMenuData } from "@/services/menu";
import { supabase } from "@/lib/supabase";
import crypto from "node:crypto";

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
        const vnTimeStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

        const now = new Date();
        const dateCode = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;

        // Count to generate billCode
        const { count } = await supabase
            .from('Bookings')
            .select('*', { count: 'exact', head: true })
            .ilike('billCode', `%-${dateCode}`);

        const nextNum = (count || 0) + 1;
        const billNum = `${String(nextNum).padStart(3, '0')}-${dateCode}`;
        const branchCode = '11NDK'; // TODO: Dynamically pass this from frontend later
        const customId = `${branchCode}-${billNum}`;

        // 1. Chèn vào bảng 'Bookings'
        const { data: booking, error: bookingError } = await supabase
            .from('Bookings')
            .insert({
                id: customId,
                billCode: billNum,
                customerName: data.customer.name,
                customerPhone: data.customer.phone,
                customerEmail: data.customer.email,
                totalAmount: calculatedTotal,
                paymentMethod: data.paymentMethod,
                createdAt: vnTimeStr,
                updatedAt: vnTimeStr,
                status: 'NEW'
            })
            .select()
            .single();

        if (bookingError) throw bookingError;

        // 2. Chèn các item vào bảng 'BookingItems'
        const { detailedItems } = await calculateOrderTotal(data.items);

        const itemsToInsert = detailedItems.map((item, index) => ({
            id: `${customId}-item${index + 1}`,
            bookingId: customId,
            serviceId: item.id,
            quantity: item.qty,
            price: item.priceOriginal
        }));

        const { error: itemsError } = await supabase
            .from('BookingItems')
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
