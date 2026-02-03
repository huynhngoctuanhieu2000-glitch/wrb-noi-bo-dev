import { NextResponse } from "next/server";
import { calculateOrderTotal, createBooking, BookingRequest } from "@/services/booking";

export async function POST(request: Request) {
    try {
        // 1. Nhận dữ liệu (Parse Body)
        const body: BookingRequest = await request.json();

        // 2. Validation cơ bản (Server-side Validation)
        if (!body.customer?.name || !body.customer?.phone) {
            return NextResponse.json(
                { success: false, message: "Thiếu thông tin khách hàng (Tên/SĐT)" },
                { status: 400 }
            );
        }

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, message: "Giỏ hàng trống" },
                { status: 400 }
            );
        }

        // 3. LOGIC QUAN TRỌNG: Tính tiền lại trên Server (Re-calculate)
        // Client có thể gửi 'totalVND' lên, nhưng ta KHÔNG tin dùng nó.
        const { totalVND, detailedItems } = await calculateOrderTotal(body.items);

        // 4. Tạo đơn hàng (Lưu Database)
        const newBooking = await createBooking(body, totalVND);

        // 5. Phản hồi thành công
        return NextResponse.json({
            success: true,
            message: "Đặt lịch thành công!",
            data: {
                bookingId: newBooking.id,
                totalVND: totalVND, // Trả về giá tiền chính thức để hiển thị
                items: detailedItems
            }
        });

    } catch (error) {
        console.error("❌ [API Booking] Error:", error);

        return NextResponse.json(
            { success: false, message: "Lỗi Server nội bộ" },
            { status: 500 }
        );
    }
}
