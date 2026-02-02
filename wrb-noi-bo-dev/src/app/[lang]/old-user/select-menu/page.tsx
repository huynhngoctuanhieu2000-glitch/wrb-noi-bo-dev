"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuTypeSelector from "@/components/MenuTypeSelector/index";

export default function OldUserSelectMenuPage({ params }: { params: Promise<{ lang: string }> }) {
    const router = useRouter();
    const [lang, setLang] = useState("en");

    useEffect(() => {
        params.then((p) => setLang(p.lang));
    }, [params]);

    const handleSelectMenu = (type: 'standard' | 'vip') => {
        localStorage.setItem('selected_menu_type', type);
        // Redirect to OLD USER menu path
        router.push(`/${lang}/old-user/${type}/menu`);
    };

    return (
        <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-6">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.postimg.cc/hPx71PLs/Gemini-Generated-Image-psjknhpsjknhpsjk.png" className="w-full h-full object-cover opacity-40" alt="background" />
            </div>

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
