import { NextResponse } from "next/server";
import { getMenuData } from "@/services/menu";

export const dynamic = 'force-dynamic'; // Vẫn giữ dynamic để Vercel không build tĩnh toàn bộ file

export async function GET() {
    try {
        const services = await getMenuData();
        const response = NextResponse.json(services);
        
        // Bổ sung Cache Header để giảm Cold Start trên Vercel
        // s-maxage=60: Edge Cache 60 giây
        // stale-while-revalidate=300: Trong 5 phút tiếp theo, trả data cũ ngay lập tức rồi ngầm fetch mới
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        
        return response;
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }
}
