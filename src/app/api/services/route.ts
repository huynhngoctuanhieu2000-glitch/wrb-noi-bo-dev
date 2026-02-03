import { NextResponse } from "next/server";
import { getMenuData } from "@/services/menu";

export const dynamic = 'force-dynamic'; // Đảm bảo luôn lấy dữ liệu mới nhất, không cache cứng

export async function GET() {
    try {
        const services = await getMenuData();
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }
}
