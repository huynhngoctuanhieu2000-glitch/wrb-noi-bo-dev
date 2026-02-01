/* src/app/[lang]/new-user/select-menu/page.tsx */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Import Component tái sử dụng
// 👇 SỬA DÒNG NÀY: Thêm "/index" vào cuối đường dẫn
import MenuTypeSelector from "@/components/MenuTypeSelector/index";

export default function SelectMenuPage({ params }: { params: Promise<{ lang: string }> }) {
    const router = useRouter();
    const [lang, setLang] = useState("en");

    // Lấy lang từ params
    useEffect(() => {
        params.then((p) => setLang(p.lang));
    }, [params]);

    // Hàm xử lý khi user chọn gói
    const handleSelectMenu = (type: 'standard' | 'vip') => {
        // 1. Lưu loại menu vào localStorage (để sau này dùng lại nếu cần)
        localStorage.setItem('selected_menu_type', type);

        // 2. Chuyển hướng đến trang Menu chi tiết
        // Ví dụ: /vn/new-user/standard/menu hoặc /vn/new-user/vip/menu
        router.push(`/${lang}/new-user/${type}/menu`);
    };

    return (
        <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-6">

            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/ z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.postimg.cc/hPx71PLs/Gemini-Generated-Image-psjknhpsjknhpsjk.png" className="w-full h-full object-cover opacity-40" />
            </div>

            {/* Component Tái Sử Dụng */}
            <div className="relative z-10 w-full">
                <MenuTypeSelector
                    lang={lang}
                    onSelect={handleSelectMenu}
                    onBack={() => router.back()}
                />
            </div>

        </div>
    );
}