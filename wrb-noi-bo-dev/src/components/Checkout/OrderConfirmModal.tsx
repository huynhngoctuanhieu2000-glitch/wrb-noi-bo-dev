import React, { useEffect, useState } from 'react';
import { X, ClipboardList, Clock, ArrowRight, Check, User, HeartPulse, Ban, GripHorizontal, AlertCircle, Phone, Mail } from 'lucide-react';
import { CartItem } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface OrderConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    lang: string;
    dict: any; // Accept dict
    cart: CartItem[];
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        gender: string;
    };
    paymentMethod: string; // code (e.g. 'cash_vnd')
    amountPaid: number;
}

const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    lang,
    dict,
    cart,
    customerInfo,
    paymentMethod,
    amountPaid,
}) => {
    // Prevent interaction if closed
    if (!isOpen) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Calculations
    const totalVND = cart.reduce((sum, item) => sum + item.priceVND * item.qty, 0);
    const changeAmount = amountPaid - totalVND;
    const totalTime = cart.reduce((sum, item) => sum + item.timeValue * item.qty, 0);

    // Collect all tags for General Notes
    const allTags = cart.reduce((acc: string[], item) => {
        const itemTags = [
            item.options?.notes?.tag0 ? 'Pregnant' : null,
            item.options?.notes?.tag1 ? 'Allergy' : null
        ].filter(Boolean) as string[];
        return [...acc, ...itemTags];
    }, []);
    const uniqueTags = Array.from(new Set(allTags));

    // Times (Estimated)
    const now = new Date();
    // Assuming user wants to see START TIME as Current + 15m (Mock logic per previous request)
    // Or if booking system integration is real, use that. Staying with +15m logic.
    const startTimeComp = new Date(now.getTime() + 15 * 60000);
    const endTimeComp = new Date(startTimeComp.getTime() + totalTime * 60000);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // 24h format HH:mm
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm({});
            setSuccess(true);
        } catch (error) {
            console.error("Submit error", error);
            alert("Error sending order. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleDone = () => {
        window.location.reload();
    };

    // --- Success View ---
    if (success) {
        return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center space-y-6 m-4 relative overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Green Glow Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-100 rounded-full blur-3xl -z-10 opacity-50"></div>

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500 border-4 border-green-50 shadow-inner">
                        <Check size={40} className="text-green-600" strokeWidth={4} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        {dict.checkout.order_submitted}
                    </h2>

                    <div className="w-full space-y-4">
                        {/* Summary Card for Success */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3 text-left">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                                <div className="font-bold text-gray-900">1. {cart[0]?.names?.[lang] || cart[0]?.names?.en || 'Service'}</div>
                                <div className="font-bold text-gray-900">{formatCurrency(cart[0]?.priceVND * cart[0]?.qty)} VND</div>
                            </div>
                            {/* Simplified view for success - just showing top level info */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{dict.checkout.payment_method}</span>
                                <span className="font-bold text-gray-900 uppercase">Cash (VND)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{dict.checkout.total_bill}</span>
                                <span className="font-bold text-amber-600 text-lg">{formatCurrency(totalVND)} VND</span>
                            </div>
                        </div>
                        {/* Expected Time Card */}
                        <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 space-y-2">
                            <div className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-2">{dict.checkout.expected_time}</div>
                            <div className="flex justify-between text-sm font-bold text-yellow-900">
                                <span>{dict.checkout.start_time}</span>
                                <span>{formatTime(startTimeComp)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-yellow-900">
                                <span>{dict.checkout.end_time}</span>
                                <span>{formatTime(endTimeComp)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleDone}
                        className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95 text-sm"
                    >
                        {dict.checkout.done}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in pb-0 sm:pb-0">
            <div
                className="bg-white w-full max-w-[480px] max-h-[90vh] sm:h-auto rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="pt-8 pb-4 flex flex-col items-center text-center px-6 bg-white shrink-0 z-10">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 border-4 border-amber-50">
                        <ClipboardList size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {dict.checkout.modal_title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        {dict.checkout.review_text}
                    </p>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-6">

                    {/* Customer Details */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{dict.checkout.customer_details}</div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{dict.checkout.name}</span>
                                <span className="font-bold text-gray-900">{customerInfo.name || 'Guest'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{dict.checkout.email_label}</span>
                                <span className="font-bold text-gray-900 truncate max-w-[200px]">{customerInfo.email || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{dict.checkout.gender_label}</span>
                                <span className="font-bold text-gray-900">{customerInfo.gender || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{dict.checkout.order_summary}</span>
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">{cart.length} {dict.checkout.items}</span>
                        </div>

                        <div className="space-y-3">
                            {cart.map((item, idx) => {
                                const strength = item.options?.strength;
                                const therapist = item.options?.therapist;
                                const focus = item.options?.bodyParts?.focus || [];
                                const avoid = item.options?.bodyParts?.avoid || [];
                                const tags = [
                                    item.options?.notes?.tag0 ? 'Pregnant' : null,
                                    item.options?.notes?.tag1 ? 'Allergy' : null
                                ].filter(Boolean) as string[];

                                return (
                                    <div key={item.cartId} className="border border-gray-100 rounded-2xl p-4 shadow-sm bg-white">
                                        {/* Name & Price */}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 text-[15px]">{idx + 1}. {item.names[lang] || item.names.en}</span>
                                            <span className="font-bold text-gray-900 text-[15px]">{formatCurrency(item.priceVND * item.qty)} VND</span>
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium mb-3">{item.timeValue}mins</div>

                                        {/* Attributes */}
                                        <div className="space-y-1.5 pt-2 border-t border-dashed border-gray-100">
                                            {/* Strength */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-5 flex justify-center"><GripHorizontal size={14} className="text-red-500" /></div>
                                                <span className="font-bold text-red-500">{dict.checkout.strength}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-red-500 font-medium capitalize">
                                                    {/* @ts-ignore */}
                                                    {dict.options?.strength_levels?.[strength?.toLowerCase()] || strength || 'Medium'}
                                                </span>
                                            </div>
                                            {/* Therapist */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-5 flex justify-center"><User size={14} className="text-purple-500" /></div>
                                                <span className="font-bold text-purple-500">{dict.checkout.therapist}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-purple-500 font-medium capitalize">
                                                    {/* @ts-ignore */}
                                                    {dict.options?.therapist_options?.[therapist?.toLowerCase()] || therapist || 'Random'}
                                                </span>
                                            </div>
                                            {/* Focus */}
                                            {focus.length > 0 && (
                                                <div className="flex items-start gap-2 text-sm">
                                                    <div className="w-5 flex justify-center mt-0.5"><HeartPulse size={14} className="text-green-600" /></div>
                                                    <span className="font-bold text-green-600 whitespace-nowrap">{dict.checkout.focus}:</span>
                                                    <span className="text-green-600 font-medium leading-tight">
                                                        {focus.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Avoid */}
                                            {avoid.length > 0 && (
                                                <div className="flex items-start gap-2 text-sm">
                                                    <div className="w-5 flex justify-center mt-0.5"><Ban size={14} className="text-red-500" /></div>
                                                    <span className="font-bold text-red-500 whitespace-nowrap">{dict.checkout.avoid}:</span>
                                                    <span className="text-red-500 font-medium leading-tight">
                                                        {avoid.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Tags */}
                                            {tags.length > 0 && (
                                                <div className="flex gap-2 mt-2 pt-1 pl-7">
                                                    {tags.map(tag => (
                                                        <span key={tag} className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{dict.checkout.payment_method}</span>
                            <span className="font-bold text-gray-900 uppercase">Cash (VND)</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-4 border-b border-gray-200 pb-3">
                            <span>{dict.checkout.total_duration}</span>
                            <span className="font-bold text-gray-900">{totalTime} mins</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700 text-lg">{dict.checkout.total_bill}</span>
                            <span className="font-bold text-amber-600 text-xl">{formatCurrency(totalVND)} VND</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-500">{dict.checkout.amount_paid}</span>
                            <span className="font-bold text-green-600">{formatCurrency(amountPaid)} VND</span>
                        </div>
                        <div className="flex justify-between items-center text-base pt-1">
                            <span className="font-bold text-gray-500">{dict.checkout.change_due}</span>
                            <span className={`font-bold ${changeAmount >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                                {changeAmount >= 0
                                    ? <span>{formatCurrency(changeAmount)} VND</span>
                                    : <span>{dict.checkout.missing} {formatCurrency(Math.abs(changeAmount))} VND</span>
                                }
                            </span>
                        </div>
                    </div>

                    {/* General Notes Alert */}
                    {uniqueTags.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <span className="font-bold text-red-500 block mb-1">{dict.checkout.general_notes}</span>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueTags.map(tag => (
                                        <span key={tag} className="text-red-600 font-medium flex items-center gap-1">
                                            {tag} {tag === 'Pregnant' ? '🤰' : '⚠️'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expected Time (Bottom Location) */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 space-y-2">
                        <div className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-2">{dict.checkout.expected_time}</div>
                        <div className="flex justify-between text-sm font-bold text-yellow-900">
                            <span>{dict.checkout.start_time}</span>
                            <span>{formatTime(startTimeComp)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-yellow-900">
                            <span>{dict.checkout.end_time}</span>
                            <span>{formatTime(endTimeComp)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-white border-t border-gray-100 flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 font-bold uppercase text-sm tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        {dict.checkout.cancel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="flex-[1.5] bg-[#0f172a] text-white py-3.5 rounded-xl font-bold uppercase text-sm tracking-widest shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        <span>{dict.checkout.submit}</span>
                        {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmModal;
