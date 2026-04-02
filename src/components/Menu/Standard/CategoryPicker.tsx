import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/components/Menu/types';
import { dictionary } from './CategoryPicker.i18n';
import { ArrowLeft } from 'lucide-react';

// 🔧 UI CONFIGURATION
const TOKENS = {
    bg: 'bg-[#0d0d0d]',
    cardBg: 'bg-[#1c1c1e]',
    textGold: 'text-[#C9A96E]',
    borderLight: 'border-white/10',
    cardBorder: 'border-white/5',
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.15,
        },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.25 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    exit: {
        opacity: 0,
        scale: 0.85,
        transition: { duration: 0.2 },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.05 },
    },
};

interface Props {
    categories: Category[];
    lang: string;
    onSelect: (ids: string[]) => void;
    onBack: () => void;
}

const CategoryPicker = ({ categories, lang, onSelect, onBack }: Props) => {
    const tTitle = dictionary.title[lang as keyof typeof dictionary.title] || dictionary.title.en;
    const tBack = dictionary.back[lang as keyof typeof dictionary.back] || dictionary.back.en;

    const handleSelect = (id: string) => {
        // Single-select: immediately navigate to menu
        onSelect([id]);
    };

    return (
        <motion.div
            className={`fixed inset-0 z-[100] flex flex-col ${TOKENS.bg} font-sans`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header / Title */}
            <motion.div
                className="pt-safe-top pt-12 pb-2 flex flex-col items-center justify-center relative"
                variants={headerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="absolute top-8 left-4 p-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    onClick={onBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ArrowLeft className="text-white w-6 h-6" strokeWidth={1.5} />
                </motion.div>
                <h1 className={`text-2xl font-serif font-medium tracking-wide ${TOKENS.textGold} relative`}>
                    {tTitle}
                </h1>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent mt-3 opacity-30"></div>
            </motion.div>

            {/* Grid Area - Scrollable */}
            <motion.div
                className="flex-1 overflow-y-auto px-6 pt-6 pb-32 hide-scrollbar"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    {categories.map((cat) => {
                        const name = cat.names[lang as keyof typeof cat.names] || cat.names['en'];

                        return (
                            <motion.button
                                key={cat.id}
                                variants={cardVariants}
                                onClick={() => handleSelect(cat.id)}
                                whileHover={{ scale: 1.04, borderColor: 'rgba(201,169,110,0.5)' }}
                                whileTap={{ scale: 0.96 }}
                                className={`flex flex-col items-center justify-center gap-4 py-6 px-4 rounded-3xl ${TOKENS.cardBg} ${TOKENS.cardBorder} border hover:border-[#C9A96E]/50 transition-colors relative overflow-hidden group shadow-lg`}
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A96E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="w-10 h-10 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110">
                                    <img
                                        src={cat.image}
                                        alt={name}
                                        className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <span className="font-medium text-[13px] tracking-wide text-center leading-snug relative z-10 w-full text-white">
                                    {name}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Footer - Back button only */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <div className="pointer-events-auto">
                    <motion.button
                        onClick={onBack}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className={`mx-auto w-[65%] max-w-xs py-4 px-6 rounded-[2rem] border-[0.5px] ${TOKENS.borderLight} bg-[#141414] hover:bg-[#1a1a1a] flex items-center justify-center gap-3 transition-all shadow-2xl`}
                    >
                        <ArrowLeft size={16} className={`${TOKENS.textGold} opacity-70`} strokeWidth={1.5} />
                        <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${TOKENS.textGold}`}>
                            {tBack}
                        </span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CategoryPicker;
