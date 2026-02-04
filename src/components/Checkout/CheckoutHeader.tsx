import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface CheckoutHeaderProps {
    title: string;
    backLabel?: string;
    onBack: () => void;
}

export default function CheckoutHeader({ title, backLabel = "Menu", onBack }: CheckoutHeaderProps) {
    return (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm pb-4 mb-6 shadow-sm border-b border-gray-100 transition-all pt-[calc(env(safe-area-inset-top))]">
            {/* Top Bar: Back + Title */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>{backLabel}</span>
                </button>
                <h1 className="text-gray-800 font-bold text-base absolute left-1/2 -translate-x-1/2">
                    {title}
                </h1>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {/* Branding Row */}
            <div className="px-5 flex items-center justify-between">
                <h2 className="text-[#0f172a] text-2xl font-bold tracking-tight">
                    Ngan Ha Spa
                </h2>
                {/* Logo Placeholder - You can replace src with actual logo if available */}
                <div className="w-12 h-12 opacity-80">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#0f172a]" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
