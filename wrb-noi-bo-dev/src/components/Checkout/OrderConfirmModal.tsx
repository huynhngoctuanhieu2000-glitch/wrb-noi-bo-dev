import React, { useEffect, useState } from 'react';
import { X, ClipboardList, Clock, ArrowRight, Check } from 'lucide-react';
import { CartItem } from '@/components/Menu/types';
import { formatCurrency } from '@/components/Menu/utils';

interface OrderConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    lang: string;
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

    // Times (Estimated)
    // In a real scenario, this might come from the booking slot selected
    const now = new Date();
    const startTime = new Date(now.getTime() + 15 * 60000); // Expect start in 15 mins
    const endTime = new Date(startTime.getTime() + totalTime * 60000);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Helper for Text Translations (Simple inline for now)
    const t = (key: string) => {
        const dict: any = {
            confirm_title: { en: 'Confirming Order', vn: 'Xác nhận yêu cầu' },
            review_text: { en: 'Please review your session details', vn: 'Vui lòng kiểm tra lại thông tin' },
            start_time: { en: 'Start Time', vn: 'Giờ bắt đầu' },
            finish_time: { en: 'Finish Time', vn: 'Giờ kết thúc' },
            customer_info: { en: 'Customer Info', vn: 'Thông tin khách hàng' },
            name: { en: 'Name', vn: 'Họ tên' },
            type: { en: 'Type', vn: 'Phân loại' },
            service_summary: { en: 'Service Summary', vn: 'Tóm tắt dịch vụ' },
            pax: { en: 'pax', vn: 'khách' },
            payment_method: { en: 'Payment Method', vn: 'Thanh toán' },
            total_bill: { en: 'Total Bill', vn: 'Tổng tiền' },
            amount_paid: { en: 'Amount Paid', vn: 'Tiền đã nhận' },
            change_due: { en: 'Change Due', vn: 'Tiền thối lại' },
            insufficient: { en: 'Insufficient', vn: 'Thiếu tiền' },
            edit: { en: 'Edit', vn: 'Chỉnh sửa' },
            send_request: { en: 'Send Request', vn: 'Gửi yêu cầu' },
            processing: { en: 'Processing...', vn: 'Đang xử lý...' },
            order_submitted: { en: 'Order Submitted', vn: 'Đã gửi đơn' },
            done: { en: 'Done', vn: 'Hoàn tất' }
        };
        return dict[key]?.[lang] || dict[key]?.['en'] || key;
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm({
                // Pass back any extra confirm data if needed
            });
            setSuccess(true);
        } catch (error) {
            console.error("Submit error", error);
            alert("Error sending order. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleDone = () => {
        // Reset everything or redirect
        window.location.reload(); // Simple reload as per user requirement to reset
    };

    // Render Success View
    if (success) {
        return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-[400px] rounded-[48px] p-8 shadow-2xl flex flex-col items-center text-center space-y-6 m-4">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500">
                        <Check size={48} className="text-green-600" strokeWidth={3} />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 uppercase">
                        {t('order_submitted')}
                    </h2>

                    <div className="bg-gray-50 rounded-2xl p-6 w-full space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-400 uppercase">Total</span>
                            <span className="font-black text-yellow-600">{formatCurrency(totalVND)} VND</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-400 uppercase">Bill ID</span>
                            <span className="font-black text-gray-900">#PENDING</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDone}
                        className="w-full bg-gray-900 text-white py-4 rounded-[24px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
                    >
                        {t('done')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in">
            <div
                className="bg-white w-full max-w-[500px] h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[40px] sm:rounded-[48px] shadow-2xl flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent -z-10" />

                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-amber-200 mb-6 border-4 border-white">
                        <ClipboardList size={32} strokeWidth={2.5} />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-tight">
                        {t('confirm_title')}
                    </h2>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                        {t('review_text')}
                    </p>

                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-all active:scale-90"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
                    <div className="space-y-8">
                        {/* 1. Time Info Card */}
                        <div className="bg-gray-900 rounded-[32px] p-6 text-white flex items-center justify-between shadow-xl">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    {t('start_time')}
                                </span>
                                <span className="text-2xl font-black italic">{formatTime(startTime)}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                                    <Clock size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tight text-amber-500">{totalTime} MINS</span>
                                </div>
                                <div className="h-[2px] w-8 bg-white/20 rounded-full mt-2" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    {t('finish_time')}
                                </span>
                                <span className="text-2xl font-black italic">{formatTime(endTime)}</span>
                            </div>
                        </div>

                        {/* 2. Customer Section */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic border-l-4 border-amber-500 pl-3">
                                {t('customer_info')}
                            </h3>
                            <div className="bg-gray-50 rounded-3xl p-6 space-y-3">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="font-bold text-gray-400 uppercase tracking-tight">{t('name')}</span>
                                    <span className="font-black text-gray-900 uppercase">{customerInfo.name || 'Guest'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="font-bold text-gray-400 uppercase tracking-tight">{t('type')}</span>
                                    <span className="font-black text-gray-900 uppercase">{customerInfo.gender || 'Unknown'}</span>
                                </div>
                            </div>
                        </section>

                        {/* 3. Items Summary */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic border-l-4 border-amber-500 pl-3">
                                {t('service_summary')}
                            </h3>
                            <div className="space-y-3">
                                {cart.map((item, idx) => {
                                    // Extract custom options for display (matching Invoice logic)
                                    const strength = item.options?.strength;
                                    const therapist = item.options?.therapist;
                                    const focus = item.options?.bodyParts?.focus || [];
                                    const avoid = item.options?.bodyParts?.avoid || [];
                                    const tags = [
                                        item.options?.notes?.tag0 ? 'Pregnant' : null,
                                        item.options?.notes?.tag1 ? 'Allergy' : null
                                    ].filter(Boolean);

                                    return (
                                        <div key={item.cartId} className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[14px] font-black text-gray-900 uppercase italic leading-none">{idx + 1}. {item.names[lang] || item.names.en}</span>
                                                    <span className="text-[11px] font-bold text-gray-400">{item.timeValue} mins • {item.qty} {t('pax')}</span>
                                                </div>
                                                <span className="text-[14px] font-black text-amber-600 italic">{formatCurrency(item.priceVND * item.qty)} VND</span>
                                            </div>

                                            {/* Customization Badges */}
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-gray-100">
                                                {strength && (
                                                    <div className="px-2 py-1 bg-purple-50 text-purple-700 text-[9px] font-black uppercase rounded-md border border-purple-100">
                                                        {strength}
                                                    </div>
                                                )}
                                                {therapist && (
                                                    <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md border border-blue-100">
                                                        {therapist}
                                                    </div>
                                                )}
                                                {focus.length > 0 && (
                                                    <div className="px-2 py-1 bg-green-50 text-green-700 text-[9px] font-black uppercase rounded-md border border-green-100">
                                                        Focus: {focus.length}
                                                    </div>
                                                )}
                                                {tags.map((tag, i) => (
                                                    <div key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-[9px] font-black uppercase rounded-md border border-yellow-100">
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 4. Payment Final */}
                        <section className="space-y-4">
                            <div className="bg-amber-500 rounded-[32px] p-8 text-white shadow-xl shadow-amber-200">
                                <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white/60">
                                        {t('payment_method')}
                                    </span>
                                    <span className="text-[13px] font-black uppercase italic">
                                        {paymentMethod === 'cash_vnd' ? 'Cash (VND)' : paymentMethod === 'cash_usd' ? 'Cash (USD)' : paymentMethod}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] font-black uppercase opacity-60">
                                            {t('total_bill')}
                                        </span>
                                        <span className="text-2xl font-black italic">{formatCurrency(totalVND)} VND</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] font-black uppercase opacity-60">
                                            {t('amount_paid')}
                                        </span>
                                        <span className="text-[15px] font-black italic">
                                            {formatCurrency(amountPaid)} VND
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-white/20">
                                        <span className="text-[13px] font-black uppercase opacity-60">
                                            {t('change_due')}
                                        </span>
                                        <span className="text-[18px] font-black italic text-gray-900 border-b-4 border-gray-900 inline-block min-w-[100px] text-right">
                                            {changeAmount >= 0 ? formatCurrency(changeAmount) + ' VND' : t('insufficient')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Fixed Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-5 rounded-[24px] text-[15px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 italic"
                    >
                        {t('edit')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="flex-[2] bg-gray-900 text-white py-5 rounded-[24px] text-[15px] font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-gray-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span>{t('processing')}</span>
                        ) : (
                            <>
                                {t('send_request')}
                                <div className="bg-amber-500 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={18} strokeWidth={3} />
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmModal;
