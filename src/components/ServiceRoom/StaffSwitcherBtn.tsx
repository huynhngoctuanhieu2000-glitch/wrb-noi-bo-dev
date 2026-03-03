'use client';

import React from 'react';
import { useStaffSwitcherLogic } from './StaffSwitcherBtn.logic';
import { t } from './StaffSwitcherBtn.i18n';

// 🔧 UI CONFIGURATION
const BTN_HEIGHT = '54px';
const BORDER_RADIUS = '16px';
const BASE_COLOR = '#F59E0B'; // Amber 500
const LOADING_COLOR = '#D97706'; // Amber 600

interface Props {
    startTimeISO: string | null;
    durationMinutes: number;
    menuType?: 'STANDARD' | 'VIP';
    lang?: 'vi' | 'en';
}

export const StaffSwitcherBtn = ({
    startTimeISO,
    durationMinutes,
    menuType = 'STANDARD',
    lang = 'vi'
}: Props) => {
    const { isVisible, isLoading, isRequested, handleRequestSwitch } = useStaffSwitcherLogic(
        startTimeISO,
        durationMinutes,
        menuType
    );
    const localeText = t[lang];

    if (!isVisible) return null; // Ẩn hoàn toàn nếu không đạt điều kiện (Khách vãng lai / quá 15p)

    return (
        <button
            onClick={handleRequestSwitch}
            disabled={isLoading || isRequested}
            className={`relative w-full overflow-hidden flex items-center justify-center gap-3 font-semibold text-white transition-all duration-300 shadow-md transform active:scale-[0.98] ${isRequested
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-inner'
                    : 'hover:opacity-90'
                }`}
            style={{
                height: BTN_HEIGHT,
                borderRadius: BORDER_RADIUS,
                backgroundColor: isRequested ? undefined : (isLoading ? LOADING_COLOR : BASE_COLOR),
            }}
        >
            {/* Loading Spinner */}
            {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}

            {/* Button Text */}
            <span className="z-10 tracking-wide">
                {isRequested ? localeText.btnRequested : isLoading ? localeText.btnLoading : localeText.btnDefault}
            </span>

            {/* Glossy Overlay (chỉ hiển thị khi là nút mặc định) */}
            {!isRequested && !isLoading && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            )}
        </button>
    );
};
