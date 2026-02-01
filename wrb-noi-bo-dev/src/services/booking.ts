import { getMenuData } from "@/services/menu";
import { Service } from "@/components/Menu/types";

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
 * @param items Danh sách item từ client (chỉ tin tưởng ID và Qty)
 * @returns Tổng tiền VND chính xác (dựa trên giá gốc từ Database)
 */
export const calculateOrderTotal = async (items: BookingItem[]): Promise<{ totalVND: number, detailedItems: any[] }> => {
    // 1. Lấy danh sách dịch vụ mới nhất từ Database (Firebase)
    // Lưu ý: getServices hiện tại gọi Firebase Client SDK, vẫn chạy ổn trên Next.js Server Runtime
    // 1. Lấy danh sách dịch vụ mới nhất từ Database (Firebase)
    // Lưu ý: getServices hiện tại gọi Firebase Client SDK, vẫn chạy ổn trên Next.js Server Runtime
    const allServices = await getMenuData();

    let totalVND = 0;
    const detailedItems = [];

    // 2. Duyệt qua từng item client gửi lên
    for (const item of items) {
        // Tìm service gốc trong database
        const service = allServices.find(s => s.id === item.id);

        if (service) {
            const lineTotal = service.priceVND * item.qty;
            totalVND += lineTotal;

            detailedItems.push({
                ...item,
                name: service.names.vn, // Lưu tên để tiện log/email
                priceOriginal: service.priceVND,
                lineTotal
            });
        } else {
            // Trường hợp không tìm thấy service (có thể bị xóa hoặc ID sai)
            console.warn(`⚠️ Warning: Service ID ${item.id} not found in DB`);
        }
    }

    return { totalVND, detailedItems };
};

/**
 * Tạo đơn hàng mới (Giả lập lưu DB)
 */
export const createBooking = async (data: BookingRequest, calculatedTotal: number) => {
    // Ở đây sau này sẽ gọi firebase.db.collection('bookings').add(...)

    // Giả lập ID đơn hàng
    const bookingId = `BK-${Date.now()}`;

    console.log(`✅ [Booking Service] Created booking ${bookingId}`);
    console.log(`💰 Client Estimated: (Unknown) | Server Calculated: ${calculatedTotal}`);

    return {
        id: bookingId,
        status: 'pending',
        createdAt: new Date(),
        total: calculatedTotal
    };
};
