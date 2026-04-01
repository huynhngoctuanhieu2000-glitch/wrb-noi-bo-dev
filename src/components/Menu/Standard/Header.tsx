/*
 * File: Standard/Header.tsx
 * Chức năng: Thanh điều hướng (Navigation Bar) trên cùng.
 * Logic chi tiết:
 * - Nhận danh sách categories và activeCategory từ parent.
 * - Hiển thị các tab danh mục (Body, Foot, Facial...).
 * - Xử lý sự kiện click: Scroll mượt (smooth scroll) đến section tương ứng.
 * - Highlight tab đang active.
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
'use client';
import React from 'react';
import { Category } from '@/components/Menu/types';
interface HeaderProps {
    categories: Category[];
    activeCategory: string;
    lang: string;
    onSelectCategory: (id: string) => void;
}

export default function Header({ categories, activeCategory, lang, onSelectCategory }: HeaderProps) {
    return (
        <div className="glass-header w-full z-30 pt-safe-top pb-2 px-2 flex flex-col shadow-lg shrink-0 relative bg-black/80 backdrop-blur-md border-b border-gray-800/50 sticky top-0">
            <div className="flex flex-row overflow-x-auto snap-x hide-scrollbar gap-x-4 pt-4 px-4 pb-2 scroll-smooth">
                {categories.map(cat => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`flex flex-col items-center gap-2 group focus:outline-none shrink-0 snap-center w-[4.5rem] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                        >
                            <div style={{ width: 60, height: 60 }} className={`rounded-full border flex items-center justify-center transition-all shadow-md overflow-hidden relative ${isActive ? 'bg-[#1a1a1a] border-[#C9A96E]' : 'bg-gray-800 border-gray-600 group-hover:bg-gray-700'}`}>
                                <img
                                    src={cat.image || 'https://placehold.co/100x100'}
                                    className="w-[70%] h-[70%] object-contain transition-transform duration-500 group-hover:scale-110"
                                    alt={cat.names['en']}
                                />
                            </div>
                            <span className={`text-[10px] font-medium uppercase tracking-tight text-center w-full truncate px-0.5 leading-tight ${isActive ? 'text-[#C9A96E]' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                {cat.names[lang as keyof typeof cat.names] || cat.names['en']}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className="text-[9px] text-center text-gray-500 uppercase tracking-widest mt-2 border-t border-gray-800 pt-1">
                — Random Staff & Room —
            </div>
        </div>
    );
}