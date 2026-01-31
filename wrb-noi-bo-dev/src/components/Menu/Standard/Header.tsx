'use client';
import React from 'react';
import { Category } from '@/components/Menu/types';
interface HeaderProps {
    categories: Category[];
    activeCategory: string;
    lang: string;
    onSelectCategory: (id: string) => void;
}

export default function Header({ categories, lang, onSelectCategory }: HeaderProps) {
    return (
        <div className="glass-header w-full z-30 pt-safe-top pb-2 px-2 flex flex-col shadow-lg shrink-0 relative bg-black/80 backdrop-blur-md border-b border-gray-800/50 sticky top-0">
            <div className="grid grid-cols-5 gap-y-4 gap-x-2 pt-4 px-2 pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className="flex flex-col items-center gap-2 group focus:outline-none shrink-0"
                    >
                        <div style={{ width: 70, height: 70 }} className="rounded-full border border-gray-600 bg-gray-800 flex items-center justify-center group-hover:border-yellow-400 group-hover:bg-gray-700 transition-all shadow-md overflow-hidden relative">
                            <img
                                src={cat.image || 'https://placehold.co/100x100'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt={cat.names['en']}
                            />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight group-hover:text-white text-center w-full truncate px-0.5 leading-none">
                            {cat.names[lang as keyof typeof cat.names] || cat.names['en']}
                        </span>
                    </button>
                ))}
            </div>
            <div className="text-[9px] text-center text-gray-500 uppercase tracking-widest mt-2 border-t border-gray-800 pt-1">
                — Random Staff & Room —
            </div>
        </div>
    );
}