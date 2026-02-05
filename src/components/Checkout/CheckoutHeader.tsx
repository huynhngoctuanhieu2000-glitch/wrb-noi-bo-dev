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
                <img
                    src="/assets/logos/spaden.png"
                    alt="Ngan Ha Spa Logo"
                    className="w-12 h-12 object-contain opacity-80"
                />
            </div>
        </div>
    );
}
