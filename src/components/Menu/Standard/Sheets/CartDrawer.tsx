import React, { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus, Hand, User, Heart, Ban, Tag, MessageSquare } from 'lucide-react';
import { useMenuData } from '@/components/Menu/MenuContext';
import { Service, CartState, CartItem, ServiceOptions } from '@/components/Menu/types';
import { formatCurrency as formatMoney, formatCurrency } from '@/components/Menu/utils'; // Alias formatMoney to formatCurrency
import CustomForYouModal from '@/components/CustomForYou';
import { ServiceData, CustomPreferences, LanguageCode } from '@/components/CustomForYou/types';
import { getDictionary } from '@/lib/dictionaries';

interface CartDrawerProps {
    cart: CartState;
    services: Service[];
    lang: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdateCart: (id: string, quantity: number) => void;
    onCheckout: () => void; // New prop for checkout navigation
}

// 🔧 UI CONFIGURATION
const CONFIG = {
    ANIMATION_DURATION: 300,
    BORDER_RADIUS: '30px',
    MAX_HEIGHT: '85vh',
    OVERLAY_COLOR: 'bg-black/60',
    BG_COLOR: 'bg-[#1e293b]',
    FOOTER_BG: 'bg-[#0f172a]',
};

// Translate Text
const TEXT = {
    title: { vn: 'Dịch vụ đã chọn', en: 'Services Selected', cn: '已选服务', jp: '選択されたサービス', kr: '선택된 서비스' },
    mins: { vn: 'phút', en: 'mins', cn: '分钟', jp: '分', kr: '分' },
    total: { vn: 'TỔNG CỘNG', en: 'TOTAL', cn: '总计', jp: '合計', kr: '합계' },
    close: { vn: 'ĐÓNG', en: 'CLOSE', cn: '关闭', jp: '閉じる', kr: '닫기' },
    continue: { vn: 'TIẾP TỤC', en: 'CONTINUE', cn: '继续', jp: '継続する', kr: '계속' },
    empty: { vn: 'Giỏ hàng trống', en: 'Your cart is empty', cn: '购物车为空', jp: 'カートは空です', kr: '장바구니가 비어 있습니다' },
    alert_empty: { vn: 'Vui lòng chọn ít nhất 1 dịch vụ!', en: 'Please select at least 1 service!', cn: '请 ít nhất 1 dịch vụ!', jp: '少なくとも1つのサービスを選択してください！', kr: '최소 1개의 서비스를 chuyên vụ!' },
};

/**
 * [NEW] CustomizationSummary Component
 * Displays the details of "Custom For You" options.
 */
const CustomizationSummary = ({ options, lang, onClick }: { options?: ServiceOptions; lang: string; onClick?: () => void }) => {
    if (!options) return null;
    const dict = getDictionary(lang);

    const hasAnyOption = options.strength || options.therapist || 
                         (options.bodyParts?.focus && options.bodyParts.focus.length > 0) || 
                         (options.bodyParts?.avoid && options.bodyParts.avoid.length > 0) ||
                         options.notes?.tag0 || options.notes?.tag1 || options.notes?.content;

    if (!hasAnyOption) return null;

    const translatePart = (key: string) => {
        const bodyPartsDict = dict.body_parts as Record<string, string>;
        return bodyPartsDict[key] || key;
    };

    return (
        <div 
            onClick={onClick}
            className="mt-1 p-3 bg-black/30 rounded-xl border border-white/5 space-y-2.5 cursor-pointer hover:bg-black/40 active:scale-[0.99] transition-all"
        >
            {/* Strength & Therapist Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
                {options.strength && (
                    <div className="flex items-center gap-1.5 min-w-fit">
                        <Hand size={13} className="text-gray-400" />
                        <span className="text-gray-400">{dict.checkout?.strength}:</span>
                        <span className="font-bold text-red-500">{dict.options?.strength_levels?.[options.strength] || options.strength}</span>
                    </div>
                )}
                {options.therapist && (
                    <div className="flex items-center gap-1.5 min-w-fit">
                        <User size={13} className="text-gray-400" />
                        <span className="text-gray-400">{dict.checkout?.therapist}:</span>
                        <span className="font-bold text-purple-400">{dict.options?.therapist_options?.[options.therapist] || options.therapist}</span>
                    </div>
                )}
            </div>

            {/* Focus / Avoid */}
            {((options.bodyParts?.focus || []).length > 0 || (options.bodyParts?.avoid || []).length > 0) && (
                <div className="space-y-1.5">
                    {options.bodyParts?.focus && options.bodyParts.focus.length > 0 && (
                        <div className="flex gap-2 text-[12px]">
                            <Heart size={13} className="text-green-500 shrink-0 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                                <span className="text-green-500 font-bold">{dict.checkout?.focus}:</span>
                                <span className="text-gray-300">
                                    {options.bodyParts.focus.length === 8 
                                        ? (dict.custom_for_you?.full_body || 'Full Body')
                                        : options.bodyParts.focus.map(translatePart).join(', ')}
                                </span>
                            </div>
                        </div>
                    )}
                    {options.bodyParts?.avoid && options.bodyParts.avoid.length > 0 && (
                        <div className="flex gap-2 text-[12px]">
                            <Ban size={13} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                                <span className="text-red-500 font-bold">{dict.checkout?.avoid}:</span>
                                <span className="text-gray-300">
                                    {options.bodyParts.avoid.length === 8 
                                        ? (dict.custom_for_you?.full_body || 'Full Body')
                                        : options.bodyParts.avoid.map(translatePart).join(', ')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tags & Content */}
            {(options.notes?.tag0 || options.notes?.tag1 || options.notes?.content) && (
                <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                        {options.notes?.tag0 && (
                            <span className="bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-yellow-500/30">
                                {dict.tags?.pregnant}
                            </span>
                        )}
                        {options.notes?.tag1 && (
                            <span className="bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-yellow-500/30">
                                {dict.tags?.allergy}
                            </span>
                        )}
                    </div>
                    {options.notes?.content && (
                        <div className="flex gap-2 text-[11px] italic text-gray-400">
                            <MessageSquare size={11} className="shrink-0 mt-1" />
                            <span>{options.notes.content}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function CartDrawer({ cart, services, lang, isOpen, onClose, onUpdateCart, onCheckout }: CartDrawerProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // [LOGIC NEW] Customization State
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

    const { addToCart, removeFromCart, updateCartItemOptions } = useMenuData();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(false); // Reset trước
            setIsClosing(false);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    /**
     * Group items logic:
     * Now group by ID AND Options to ensure unique customizations are shown separately.
     */
    const groupedCart = useMemo(() => {
        const groups: { [key: string]: CartItem & { totalQty: number; displayKey: string } } = {};

        cart.forEach(item => {
            // Create a unique key based on ID and serialized options
            const optionsKey = JSON.stringify(item.options || {});
            const displayKey = `${item.id}-${optionsKey}`;

            if (!groups[displayKey]) {
                groups[displayKey] = { ...item, totalQty: 0, displayKey };
            }
            groups[displayKey].totalQty += item.qty;
        });

        return Object.values(groups);
    }, [cart]);

    const handleOpenCustomModal = (item: CartItem) => {
        setEditingItem(item);
        setIsCustomModalOpen(true);
    };

    const handleSaveCustom = (prefs: CustomPreferences) => {
        if (!editingItem) return;

        // Map CustomPreferences back to ServiceOptions
        const options: ServiceOptions = {
            strength: prefs.strength as any,
            therapist: prefs.therapist as any,
            bodyParts: prefs.bodyParts,
            notes: prefs.notes
        };

        updateCartItemOptions(editingItem.cartId, options);
        setIsCustomModalOpen(false);
        setEditingItem(null);
    };

    const mapCartItemToServiceData = (item: CartItem): ServiceData => {
        return {
            ID: item.id,
            NAMES: item.names as any,
            FOCUS_POSITION: item.FOCUS_POSITION as any,
            TAGS: item.TAGS as any,
            SHOW_STRENGTH: item.SHOW_STRENGTH,
            HINT: item.HINT as any,
            PRICE_VN: item.priceVND,
            PRICE_USD: item.priceUSD
        };
    };

    const handlePlus = (item: CartItem) => {
        // [MODIFIED] Preserve options when adding quantity
        addToCart(item as any, 1, item.options);
    };

    const handleMinus = (displayKey: string) => {
        // Find the last instance in the cart that matches this group's displayKey
        // In grouped view, the "displayKey" identifies items with same ID and Options.
        const instance = cart.find(c => {
            const optionsKey = JSON.stringify(c.options || {});
            return `${c.id}-${optionsKey}` === displayKey;
        });

        if (instance) {
            removeFromCart(instance.cartId);
        }
    };

    // Restore missing logic
    const { totalVND, totalUSD } = useMemo(() => {
        return cart.reduce((acc, item) => ({
            totalVND: acc.totalVND + (item.priceVND || 0) * item.qty,
            totalUSD: acc.totalUSD + (item.priceUSD || 0) * item.qty
        }), { totalVND: 0, totalUSD: 0 });
    }, [cart]);

    const t = (key: keyof typeof TEXT) => TEXT[key][lang as keyof typeof TEXT['title']] || TEXT[key]['en'];

    const handleContinue = () => {
        if (cart.length === 0) {
            alert(t('alert_empty'));
            return;
        }
        onCheckout();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 ${CONFIG.OVERLAY_COLOR} z-40 transition-opacity duration-${CONFIG.ANIMATION_DURATION} ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Drawer Container */}
            <div className={`
                fixed bottom-0 left-0 w-full ${CONFIG.BG_COLOR} rounded-t-[${CONFIG.BORDER_RADIUS}] z-50 overflow-hidden flex flex-col shadow-2xl
                transform transition-transform duration-${CONFIG.ANIMATION_DURATION} ease-out pb-safe
                ${(isClosing || !isVisible) ? 'translate-y-full' : 'translate-y-0'}
            `} style={{ maxHeight: CONFIG.MAX_HEIGHT }}>

                {/* Header handle bar */}
                <div className="w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full opacity-50"></div>
                </div>

                {/* Title */}
                <div className="text-center pb-6 pt-2">
                    <h2 className="text-xl font-bold text-yellow-500 uppercase tracking-widest">{t('title')}</h2>
                    <div className="w-10 h-0.5 bg-yellow-600 mx-auto mt-2"></div>
                </div>

                {/* 3. Danh sách món (Grouped) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {groupedCart.length === 0 ? (
                        <div className="text-center text-gray-500 italic mt-10">
                            {t('empty')}
                        </div>
                    ) : (
                        groupedCart.map((item) => (
                            <div key={item.displayKey} className="flex flex-col gap-3 bg-gray-900/50 p-4 rounded-2xl border border-white/10 shadow-lg relative">
                                <div className="flex gap-4">
                                    {/* Ảnh */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                        <img src={item.img} alt={item.names[lang]} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Info Middle */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                        {/* Row 1: Name and Price */}
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-yellow-500 leading-tight truncate text-[16px]">{item.names[lang]}</h4>
                                            <div className="font-bold text-white text-[15px] shrink-0 ml-2">
                                                {formatMoney(item.priceVND * item.totalQty)} VND
                                            </div>
                                        </div>

                                        {/* Row 2: Time and Quantity */}
                                        <div className="flex justify-between items-center mt-1">
                                            {(item.timeValue > 0 || item.timeDisplay) && (
                                                <div className="text-xs text-gray-400">
                                                    <span>{item.timeDisplay || `${item.timeValue} mins`}</span>
                                                </div>
                                            )}
                                            
                                            {/* Quantity Controls (Condensed Pill Shape) */}
                                            <div className="flex items-center gap-2 bg-gray-800 rounded-full px-2 py-0.5 border border-white/5">
                                                <button
                                                    onClick={() => handleMinus(item.displayKey)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="font-bold text-white w-4 text-center text-[13px]">{item.totalQty}</span>
                                                <button
                                                    onClick={() => handlePlus(item)}
                                                    className="w-7 h-7 flex items-center justify-center text-yellow-500 hover:text-yellow-400 transition-colors"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* [LOGIC NEW] Customization Summary (Clickable to Edit) */}
                                <CustomizationSummary 
                                    options={item.options} 
                                    lang={lang} 
                                    onClick={() => handleOpenCustomModal(item)}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Totals & Actions */}
                <div className={`p-5 ${CONFIG.FOOTER_BG} border-t border-gray-800`}>

                    {/* Total Row */}
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-gray-400 font-bold tracking-widest text-sm mb-1 uppercase">{t('total')}</span>
                        <div className="text-right">
                            <div className="text-xl font-bold text-yellow-500">
                                {formatCurrency(totalVND)} VND <span className="text-sm font-normal text-gray-400">/</span> <span className="text-red-500 font-bold">{totalUSD} USD</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-4 rounded-2xl border border-gray-700 text-gray-400 font-bold uppercase hover:bg-gray-800 hover:text-white transition-all active:scale-95"
                        >
                            {t('close')}
                        </button>
                        <button
                            onClick={handleContinue}
                            className="flex-[1.5] py-4 rounded-2xl bg-yellow-600 text-black font-bold uppercase shadow-lg shadow-yellow-600/20 hover:bg-yellow-500 transition-all active:scale-95"
                        >
                            {t('continue')}
                        </button>
                    </div>
                </div>

            </div>

            {/* Custom For You Modal */}
            {editingItem && (
                <CustomForYouModal
                    isOpen={isCustomModalOpen}
                    onClose={() => {
                        setIsCustomModalOpen(false);
                        setEditingItem(null);
                    }}
                    onSave={handleSaveCustom}
                    serviceData={mapCartItemToServiceData(editingItem)}
                    lang={lang as LanguageCode}
                    initialData={editingItem.options as any}
                />
            )}
        </>
    );
}
