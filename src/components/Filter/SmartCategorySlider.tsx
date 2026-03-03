'use client';

import React from 'react';
import { SpaCategory, SPA_CATEGORIES } from '@/constants/SpaCategories';
import { useServiceFilter } from './SmartCategorySlider.logic';

// 🔧 UI CONFIGURATION
const ICON_CONTAINER_SIZE = '64px';
const ICON_SIZE = '28px';
const BORDER_RADIUS = '16px';
const ACTIVE_COLOR = '#10B981'; // Emerald 500 - Relaxing spa vibe
const INACTIVE_COLOR = '#F3F4F6'; // Gray 100
const ACTIVE_TEXT_COLOR = '#047857'; // Emerald 700

export const SmartCategorySlider = ({ lang = 'vi' }: { lang?: 'vi' | 'en' }) => {
    const { categoryId, setCategoryId } = useServiceFilter();

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-4 px-2">
            <div className="flex gap-4 min-w-max">
                {SPA_CATEGORIES.map((category) => {
                    const isActive = category.id === categoryId;

                    return (
                        <button
                            key={category.id}
                            onClick={() => setCategoryId(category.id)}
                            className="flex flex-col items-center gap-2 transition-transform active:scale-95 touch-manipulation"
                        >
                            <div
                                className="flex items-center justify-center shadow-sm transition-colors duration-300"
                                style={{
                                    width: ICON_CONTAINER_SIZE,
                                    height: ICON_CONTAINER_SIZE,
                                    borderRadius: BORDER_RADIUS,
                                    backgroundColor: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                                    color: isActive ? 'white' : '#6B7280', // Text gray 500
                                }}
                            >
                                <svg
                                    width={ICON_SIZE}
                                    height={ICON_SIZE}
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d={category.iconPath} />
                                </svg>
                            </div>
                            <span
                                className="text-xs font-medium max-w-[70px] text-center leading-tight transition-colors duration-300"
                                style={{
                                    color: isActive ? ACTIVE_TEXT_COLOR : '#6B7280',
                                }}
                            >
                                {category.label[lang]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
