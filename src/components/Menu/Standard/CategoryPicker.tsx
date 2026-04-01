import React, { useState } from 'react';
import { Category } from '@/components/Menu/types';
import { dictionary } from './CategoryPicker.i18n';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

// Design tokens
const TOKENS = {
    bg: 'bg-[#0d0d0d]',
    cardBg: 'bg-[#1c1c1e]',
    textGold: 'text-[#C9A96E]',
    borderLight: 'border-white/10',
    cardBorder: 'border-white/5',
};

interface Props {
    categories: Category[];
    lang: string;
    onSelect: (ids: string[]) => void;
    onBack: () => void;
}

export default function CategoryPicker({ categories, lang, onSelect, onBack }: Props) {
    const tTitle = dictionary.title[lang as keyof typeof dictionary.title] || dictionary.title.en;
    const tBack = dictionary.back[lang as keyof typeof dictionary.back] || dictionary.back.en;

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggle = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            }
            if (prev.length >= 3) {
                // Remove oldest, add newest
                return [...prev.slice(1), id];
            }
            return [...prev, id];
        });
    };

    const isSearching = selectedIds.length > 0;

    // Create a virtual "Best Seller" category to appear first
    const bestSellerCat = {
        id: 'BestSeller',
        names: {
            en: 'Best Seller 🌟',
            vi: 'Dịch Vụ Nổi Bật 🌟',
            jp: 'おすすめ 🌟',
            kr: '인기 서비스 🌟',
            cn: '热销 🌟'
        },
        image: '/assets/icons/combo-king.webp'
    };

    const fullCategories = [bestSellerCat, ...categories];

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col ${TOKENS.bg} font-sans`}>
            {/* Header / Title */}
            <div className={`pt-safe-top pt-12 pb-2 flex flex-col items-center justify-center relative`}>
                <div className="absolute top-8 left-4 p-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={onBack}>
                    <ArrowLeft className="text-white w-6 h-6" strokeWidth={1.5} />
                </div>
                <h1 className={`text-2xl font-serif font-medium tracking-wide ${TOKENS.textGold} relative`}>
                    {tTitle}
                </h1>
                <div className="text-[11px] text-gray-500 uppercase tracking-widest mt-2 font-medium">
                    {lang === 'vi' ? 'Chọn tối đa 3 mục' : 'Select up to 3 items'}
                </div>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent mt-3 opacity-30"></div>
            </div>

            {/* Grid Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 hide-scrollbar">
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    {fullCategories.map((cat) => {
                        const name = cat.names[lang as keyof typeof cat.names] || cat.names['en'];
                        const isSelected = selectedIds.includes(cat.id);
                        
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleToggle(cat.id)}
                                className={`flex flex-col items-center justify-center gap-4 py-6 px-4 rounded-3xl ${isSelected ? 'bg-[#2a2a2c] border-[#C9A96E]' : `${TOKENS.cardBg} ${TOKENS.cardBorder}`} border hover:border-[#C9A96E]/50 transition-all active:scale-[0.98] relative overflow-hidden group shadow-lg`}
                            >
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-[#C9A96E]/5 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                
                                {isSelected && (
                                    <div className="absolute top-3 right-3 text-[#C9A96E]">
                                        <CheckCircle2 size={18} />
                                    </div>
                                )}

                                <div className={`w-10 h-10 flex items-center justify-center relative z-10 transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <img 
                                        src={cat.image} 
                                        alt={name}
                                        className={`w-full h-full object-contain ${isSelected ? 'opacity-100' : 'opacity-80'}`}
                                    />
                                </div>
                                <span className={`font-medium text-[13px] tracking-wide text-center leading-snug relative z-10 w-full ${isSelected ? 'text-[#C9A96E]' : 'text-white'}`}>
                                    {name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer fixed */}
            <div className={`fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pointer-events-none`}>
                <div className="pointer-events-auto">
                    {isSearching ? (
                        <button 
                            onClick={() => onSelect(selectedIds)}
                            className={`mx-auto w-[85%] max-w-xs py-4 px-6 rounded-[2rem] bg-gradient-to-r from-[#C9A96E] to-[#B39359] text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(201,169,110,0.3)] animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            {lang === 'vi' ? `TÌM KIẾM (${selectedIds.length})` : `SEARCH (${selectedIds.length})`}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    ) : (
                        <button 
                            onClick={onBack}
                            className={`mx-auto w-[65%] max-w-xs py-4 px-6 rounded-[2rem] border-[0.5px] ${TOKENS.borderLight} bg-[#141414] hover:bg-[#1a1a1a] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl animate-in fade-in duration-300`}
                        >
                            <ArrowLeft size={16} className={`${TOKENS.textGold} opacity-70`} strokeWidth={1.5} />
                            <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${TOKENS.textGold}`}>
                                {tBack}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
