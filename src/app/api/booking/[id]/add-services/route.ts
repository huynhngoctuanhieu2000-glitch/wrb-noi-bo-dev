import { NextResponse } from "next/server";
import { addServicesToBooking, BookingItem } from "@/services/booking";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: bookingId } = params;
        const body = await request.json();

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, message: "Giỏ hàng trống" },
                { status: 400 }
            );
        }

        const adminId = body.addedBy || 'ADMIN';

        const result = await addServicesToBooking(bookingId, body.items as BookingItem[], adminId);

        return NextResponse.json({
            success: true,
            message: "Thêm dịch vụ thành công!",
            data: result
        });

    } catch (error: any) {
        console.error("❌ [API Add Services] Error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Lỗi Server nội bộ" },
            { status: 500 }
        );
    }
}
