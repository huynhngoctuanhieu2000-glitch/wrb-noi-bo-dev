'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ServiceItem } from '@/components/Journey/useJourneyRealtime';

// 🔧 UI CONFIGURATION
const ANIMATION_DURATION = 400;
const RATING_OPTIONS = [
    { value: 1, emoji: '😡', label: 'Tệ', labelEN: 'Bad', selectedClass: 'bg-red-100 border-red-400 text-red-700 scale-110' },
    { value: 2, emoji: '😐', label: 'OK', labelEN: 'Ok', selectedClass: 'bg-gray-100 border-gray-400 text-gray-700 scale-110' },
    { value: 3, emoji: '🙂', label: 'Tốt', labelEN: 'Good', selectedClass: 'bg-amber-100 border-amber-400 text-amber-700 scale-110' },
    { value: 4, emoji: '🤩', label: 'Xuất sắc', labelEN: 'Excellent', selectedClass: 'bg-amber-200 border-amber-500 text-amber-900 scale-110' },
];

const VIOLATIONS_VI = [
    '1. Nhân viên sử dụng điện thoại riêng trong giờ làm?',
    '2. Nhân viên gợi ý hoặc xin tiền thưởng (tip)?',
    '3. Nhân viên nói chuyện riêng quá nhiều?',
    '4. Nhân viên thực hiện sai quy trình?',
    '5. Nhân viên không sắp xếp và bảo quản đồ của khách?',
    '6. Nhân viên có thông báo bấm giờ khi bắt đầu dịch vụ không?',
];
const VIOLATIONS_EN = [
    '1. Therapist using personal phone during service?',
    '2. Therapist hinting or asking for a tip?',
    '3. Therapist talking too much?',
    '4. Therapist not following the core process?',
    '5. Therapist not arranging/safeguarding my belongings?',
    '6. Did the therapist notify when the timer started?',
];

// ─── Timer Hook ───────────────────────────────────────────────────────────────
const useItemTimer = (duration: number, computedTimeStart: string | null | undefined) => {
    const totalSeconds = duration * 60;
    const getElapsed = () => {
        if (!computedTimeStart) return 0;
        let norm = computedTimeStart;
        if (!norm.includes('Z') && !norm.includes('+')) norm = norm.replace(' ', 'T') + 'Z';
        const diff = Math.floor((Date.now() - new Date(norm).getTime()) / 1000);
        return Math.max(0, Math.min(diff, totalSeconds));
    };

    const [elapsed, setElapsed] = useState(getElapsed);
    useEffect(() => { setElapsed(getElapsed()); }, [computedTimeStart]);
    useEffect(() => {
        if (!computedTimeStart) return;
        const id = setInterval(() => setElapsed(p => Math.min(p + 1, totalSeconds)), 1000);
        return () => clearInterval(id);
    }, [computedTimeStart, totalSeconds]);

    const remaining = totalSeconds - elapsed;
    const pct = computedTimeStart ? (remaining / totalSeconds) * 100 : 100;
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    return { formattedTime: `${mm}:${ss}`, pct, isStarted: !!computedTimeStart };
};

// ─── Check Belongings Popup ───────────────────────────────────────────────────
const CheckBelongingsPopup = ({ lang, onConfirm }: { lang: string; onConfirm: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
        <div className={`w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-${ANIMATION_DURATION}`}>
            {/* Icon */}
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl border-2 border-amber-100">
                    👜
                </div>
            </div>
            <h2 className="text-xl font-black text-gray-800 text-center mb-2">
                {lang === 'vi' ? 'Nhắc nhở trước khi ra về' : 'Before You Leave'}
            </h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-6">
                {lang === 'vi'
                    ? 'Vui lòng kiểm tra kỹ điện thoại, ví, đồng hồ và các vật dụng cá nhân của bạn trước khi rời khỏi phòng nhé!'
                    : 'Please check your phone, wallet, watch and personal belongings before leaving the room!'}
            </p>
            <div className="space-y-2 mb-6">
                {(lang === 'vi'
                    ? ['📱 Điện thoại', '👛 Ví tiền', '⌚ Đồng hồ / Trang sức', '🔑 Chìa khóa / Thẻ']
                    : ['📱 Phone', '👛 Wallet', '⌚ Watch / Jewelry', '🔑 Keys / Cards']
                ).map((item) => (
                    <div key={item} className="flex items-center gap-3 bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
                        <span className="font-semibold text-amber-800 text-sm">{item}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={onConfirm}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-base shadow-lg active:scale-95 transition-all"
            >
                {lang === 'vi' ? '✅ Đã kiểm tra — Tiến hành đánh giá' : '✅ Checked — Rate Now'}
            </button>
        </div>
    </div>
);

// ─── Service Detail Panel (Full-screen slide-in) ─────────────────────────────
const ServiceDetailPanel = ({
    item,
    lang,
    bookingId,
    roomName,
    bedId,
    onBack,
    onSOS,
    isSosLoading,
    sosSent,
    isAuthUser,
    onAddService,
    onChangeStaff,
    isActionLoading,
    actionSuccess,
    onSubmitRating,
}: {
    item: ServiceItem;
    lang: string;
    bookingId: string;
    roomName?: string;
    bedId?: string;
    onBack: () => void;
    onSOS?: () => void;
    isSosLoading?: boolean;
    sosSent?: boolean;
    isAuthUser?: boolean;
    onAddService?: () => void;
    onChangeStaff?: () => void;
    isActionLoading?: boolean;
    actionSuccess?: string | null;
    onSubmitRating: (rating: number, feedback: string, violations: number[]) => Promise<void>;
}) => {
    const { formattedTime, pct, isStarted } = useItemTimer(item.duration, item.computedTimeStart);
    const [selectedViolations, setSelectedViolations] = useState<number[]>([]);
    const [sentViolations, setSentViolations] = useState<Set<number>>(new Set());
    const [showCheckBelongings, setShowCheckBelongings] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const isCompleted = item.status === 'COMPLETED';
    const isAlreadyRated = item.itemRating !== null && item.itemRating !== undefined;
    const violations = lang === 'vi' ? VIOLATIONS_VI : VIOLATIONS_EN;
    const circumference = 2 * Math.PI * 110;

    const t = {
        back: lang === 'vi' ? 'Quay lại' : 'Back',
        doing: lang === 'vi' ? 'Đang thực hiện' : 'In Progress',
        waiting: lang === 'vi' ? 'Chờ bắt đầu' : 'Waiting',
        done: lang === 'vi' ? 'Hoàn thành' : 'Completed',
        room: lang === 'vi' ? 'Phòng' : 'Room',
        bed: lang === 'vi' ? 'Giường' : 'Bed',
        therapist: lang === 'vi' ? 'Kỹ thuật viên' : 'Therapist',
        quickFeedback: lang === 'vi' ? 'Góp ý nhanh (không bắt buộc)' : 'Quick feedback (optional)',
        rateService: lang === 'vi' ? 'Đánh giá dịch vụ này' : 'Rate this service',
        submitRating: lang === 'vi' ? 'Gửi đánh giá' : 'Submit Rating',
        submitting: lang === 'vi' ? 'Đang gửi...' : 'Submitting...',
        sos: lang === 'vi' ? 'BÁO KHẨN CẤP' : 'SOS',
        sosSent: lang === 'vi' ? 'ĐÃ BÁO' : 'SENT',
        addService: lang === 'vi' ? 'Thêm DV' : 'Add',
        changeStaff: lang === 'vi' ? 'Đổi NV' : 'Change',
        notified: lang === 'vi' ? 'Đã báo' : 'Notified',
        alreadyRated: lang === 'vi' ? '⭐ Đã đánh giá' : '⭐ Rated',
        rateNow: lang === 'vi' ? 'Dịch vụ đã hoàn thành — Đánh giá ngay' : 'Service done — Rate now',
    };

    const sendViolationNotification = async (idx: number, text: string) => {
        if (sentViolations.has(idx)) return;
        setSentViolations(prev => new Set([...prev, idx]));
        try {
            await fetch('/api/notifications/normal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    type: 'FEEDBACK',
                    message: `⚠️ Khách${roomName ? ` phòng ${roomName}` : ''}${bedId ? ` giường ${bedId}` : ''} - DV "${item.service_name}" phản hồi: ${text}`,
                }),
            });
        } catch { /* silent */ }
    };

    const toggleViolation = (idx: number) => {
        const isSelecting = !selectedViolations.includes(idx);
        setSelectedViolations(prev =>
            isSelecting ? [...prev, idx] : prev.filter(i => i !== idx)
        );
        if (isSelecting && !sentViolations.has(idx)) {
            sendViolationNotification(idx, violations[idx]);
        }
    };

    const handleRateClick = () => {
        if (isAlreadyRated) return;
        // Show check belongings popup first
        setShowCheckBelongings(true);
    };

    const handleBelongingsConfirmed = () => {
        setShowCheckBelongings(false);
        setShowRating(true);
    };

    const handleSubmitRating = async () => {
        if (!selectedRating || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmitRating(selectedRating, '', selectedViolations);
            setIsDone(true);
            setShowRating(false);
        } catch { /* noop */ } finally { setIsSubmitting(false); }
    };

    return (
        <>
            <div className={`fixed inset-0 z-40 bg-[#FDFBF7] flex flex-col animate-in slide-in-from-right duration-${ANIMATION_DURATION}`}>
                {/* Header */}
                <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-3 shadow-sm flex-shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h2 className="font-black text-gray-800 text-base leading-tight">{item.service_name}</h2>
                        <p className="text-xs text-gray-400 font-medium">
                            {roomName && `${t.room} ${roomName}`}{bedId && ` · ${t.bed} ${bedId}`}
                        </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isAlreadyRated || isDone ? 'bg-green-100 text-green-700' :
                        isCompleted ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        'bg-blue-50 text-blue-600'
                    }`}>
                        {isAlreadyRated || isDone ? t.alreadyRated : isCompleted ? t.done : isStarted ? t.doing : t.waiting}
                    </span>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-md mx-auto px-4 py-6 space-y-6">

                        {/* Timer Circle */}
                        {!isAlreadyRated && !isDone && (
                            <div className="flex flex-col items-center">
                                <div className="relative flex items-center justify-center">
                                    <svg className="-rotate-90 drop-shadow-lg" width="260" height="260" viewBox="0 0 260 260">
                                        <circle cx="130" cy="130" r="110" fill="none" stroke={isStarted ? '#FFFBEB' : '#F3F4F6'} strokeWidth="8" />
                                        <circle
                                            cx="130" cy="130" r="110" fill="none"
                                            stroke={isCompleted ? '#10B981' : isStarted ? '#F59E0B' : '#D1D5DB'}
                                            strokeWidth="12" strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={isCompleted ? 0 : circumference - (pct / 100) * circumference}
                                            className="transition-all duration-1000 ease-linear"
                                        />
                                    </svg>
                                    <div className={`absolute rounded-full flex flex-col items-center justify-center shadow-lg ${
                                        isCompleted ? 'bg-green-50' : isStarted ? 'bg-amber-50' : 'bg-gray-50'
                                    }`} style={{ width: 180, height: 180 }}>
                                        {isCompleted ? (
                                            <>
                                                <span className="text-4xl">✅</span>
                                                <span className="text-sm font-black text-green-700 mt-1">{t.done}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className={`text-5xl font-black tracking-tighter ${isStarted ? 'text-amber-900' : 'text-gray-400'}`}>
                                                    {formattedTime}
                                                </span>
                                                {!isStarted && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider animate-pulse">{t.waiting}</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Already Rated */}
                        {(isAlreadyRated || isDone) && (
                            <div className="flex flex-col items-center py-8">
                                <div className="text-6xl mb-3">{RATING_OPTIONS.find(r => r.value === (isDone ? selectedRating : item.itemRating))?.emoji || '⭐'}</div>
                                <p className="font-black text-gray-800 text-lg">
                                    {RATING_OPTIONS.find(r => r.value === (isDone ? selectedRating : item.itemRating))?.label}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">{lang === 'vi' ? 'Cảm ơn bạn đã đánh giá!' : 'Thank you for your rating!'}</p>
                            </div>
                        )}

                        {/* KTV Info */}
                        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-100 flex-shrink-0">
                                <img src={item.staffAvatar || 'https://i.pravatar.cc/150?img=32'} alt="KTV" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">{t.therapist}</p>
                                <p className="font-black text-gray-800 text-base">{item.staffName || item.technicianCode || '—'}</p>
                                <p className="text-gray-400 text-xs">{item.duration} phút</p>
                            </div>
                        </div>

                        {/* Rate now CTA (when completed, not yet rated) */}
                        {isCompleted && !isAlreadyRated && !isDone && !showRating && (
                            <button
                                onClick={handleRateClick}
                                className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl text-base shadow-lg active:scale-95 transition-all animate-pulse"
                            >
                                ⭐ {t.rateNow}
                            </button>
                        )}

                        {/* Rating Form (after check belongings) */}
                        {showRating && !isDone && (
                            <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-md">
                                <p className="font-bold text-gray-800 text-base mb-4">{t.rateService}</p>
                                <div className="grid grid-cols-4 gap-2 mb-5">
                                    {RATING_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSelectedRating(opt.value)}
                                            className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                                                selectedRating === opt.value
                                                    ? opt.selectedClass
                                                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            <span className="text-2xl mb-1">{opt.emoji}</span>
                                            <span className="text-[10px] font-bold text-center leading-tight">
                                                {lang === 'vi' ? opt.label : opt.labelEN}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={!selectedRating || isSubmitting}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                        selectedRating && !isSubmitting
                                            ? 'bg-gray-900 text-white shadow-md active:scale-95'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isSubmitting
                                        ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>{t.submitting}</>
                                        : selectedRating ? t.submitRating : lang === 'vi' ? 'Chọn mức độ để gửi' : 'Select to submit'}
                                </button>
                            </div>
                        )}

                        {/* Quick Violations (only during IN_PROGRESS) */}
                        {!isCompleted && !isAlreadyRated && !isDone && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-700 text-sm">{t.quickFeedback}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                        {lang === 'vi' ? 'Tùy chọn' : 'Optional'}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {violations.map((v, idx) => {
                                        const isSel = selectedViolations.includes(idx);
                                        const isSent = sentViolations.has(idx);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => toggleViolation(idx)}
                                                className={`flex items-start gap-3 p-3.5 bg-white rounded-2xl cursor-pointer border transition-all ${
                                                    isSent ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                                                }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                                    isSent ? 'border-green-500 bg-green-500' :
                                                    isSel ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                                                }`}>
                                                    {(isSel || isSent) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <span className={`text-xs leading-snug font-medium flex-1 ${
                                                    isSent ? 'text-green-700' : isSel ? 'text-amber-900' : 'text-gray-500'
                                                }`}>{v}</span>
                                                {isSent && <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">{lang === 'vi' ? 'Đã báo' : 'Sent'}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!isAlreadyRated && !isDone && (
                            <div className="flex flex-col gap-3 pb-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={onAddService} disabled={isActionLoading || actionSuccess === 'ADD_SERVICE'}
                                        className={`py-4 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${actionSuccess === 'ADD_SERVICE' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                                        {actionSuccess === 'ADD_SERVICE' ? '✓' : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                                        {actionSuccess === 'ADD_SERVICE' ? (lang === 'vi' ? 'Đã báo' : 'Notified') : t.addService}
                                    </button>
                                    {isAuthUser && (
                                        <button onClick={onChangeStaff} disabled={isActionLoading || actionSuccess === 'CHANGE_STAFF'}
                                            className={`py-4 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border-2 active:scale-95 ${actionSuccess === 'CHANGE_STAFF' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-800 border-gray-100'}`}>
                                            {actionSuccess === 'CHANGE_STAFF' ? '✓' : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                                            {actionSuccess === 'CHANGE_STAFF' ? (lang === 'vi' ? 'Đã báo' : 'Notified') : t.changeStaff}
                                        </button>
                                    )}
                                </div>
                                <button onClick={onSOS} disabled={isSosLoading || sosSent}
                                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isSosLoading ? 'bg-gray-200 text-gray-400' : sosSent ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700 animate-pulse'}`}>
                                    {sosSent ? '✓' : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>}
                                    <span className="tracking-widest uppercase">{sosSent ? t.sosSent : t.sos}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Check Belongings Popup */}
            {showCheckBelongings && (
                <CheckBelongingsPopup lang={lang} onConfirm={handleBelongingsConfirmed} />
            )}
        </>
    );
};

// ─── Status badge helper ──────────────────────────────────────────────────────
const getStatusMeta = (item: ServiceItem, lang: string) => {
    const isRated = item.itemRating !== null && item.itemRating !== undefined;
    const isCompleted = item.status === 'COMPLETED';
    if (isRated) return { dot: 'bg-green-400', label: lang === 'vi' ? '⭐ Đã đánh giá' : '⭐ Rated', cls: 'bg-green-50 text-green-700 border-green-100' };
    if (isCompleted) return { dot: 'bg-amber-400 animate-ping', label: lang === 'vi' ? 'Chờ đánh giá' : 'Rate now', cls: 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' };
    return { dot: 'bg-blue-400 animate-pulse', label: lang === 'vi' ? 'Đang làm' : 'Live', cls: 'bg-blue-50 text-blue-600 border-blue-100' };
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ServiceListProps {
    items: ServiceItem[];
    lang?: string;
    bookingId: string;
    roomName?: string;
    bedId?: string;
    fallbackStaffName?: string;
    fallbackStaffAvatar?: string;
    onSOS?: () => void;
    isSosLoading?: boolean;
    sosSent?: boolean;
    isAuthUser?: boolean;
    onAddService?: () => void;
    onChangeStaff?: () => void;
    isActionLoading?: boolean;
    actionSuccess?: string | null;
    onItemRated: (itemId: string, rating: number, feedback: string) => Promise<void>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ServiceList = ({
    items,
    lang = 'vi',
    bookingId,
    roomName,
    bedId,
    fallbackStaffName,
    fallbackStaffAvatar,
    onSOS,
    isSosLoading,
    sosSent,
    isAuthUser,
    onAddService,
    onChangeStaff,
    isActionLoading,
    actionSuccess,
    onItemRated,
}: ServiceListProps) => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const selectedItem = items.find(i => i.id === selectedItemId);

    const handleItemRated = useCallback(async (rating: number, feedback: string, violations: number[]) => {
        if (!selectedItemId) return;
        await onItemRated(selectedItemId, rating, feedback);
    }, [selectedItemId, onItemRated]);

    // If detail panel is open
    if (selectedItem) {
        return (
            <ServiceDetailPanel
                item={selectedItem}
                lang={lang}
                bookingId={bookingId}
                roomName={roomName}
                bedId={bedId}
                onBack={() => setSelectedItemId(null)}
                onSOS={onSOS}
                isSosLoading={isSosLoading}
                sosSent={sosSent}
                isAuthUser={isAuthUser}
                onAddService={onAddService}
                onChangeStaff={onChangeStaff}
                isActionLoading={isActionLoading}
                actionSuccess={actionSuccess}
                onSubmitRating={handleItemRated}
            />
        );
    }

    const ratedCount = items.filter(i => i.itemRating !== null && i.itemRating !== undefined).length;

    return (
        <div className="flex flex-col w-full gap-3 py-2 pb-10">
            {/* Progress summary */}
            {items.length > 1 && (
                <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3 mb-1">
                    <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                style={{ width: `${(ratedCount / items.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-xs font-black text-gray-500 whitespace-nowrap">
                        {ratedCount}/{items.length} {lang === 'vi' ? 'đã đánh giá' : 'rated'}
                    </span>
                </div>
            )}

            {/* Service Cards */}
            {items.map((item) => {
                const meta = getStatusMeta(item, lang);
                const isCompleted = item.status === 'COMPLETED';
                const isRated = item.itemRating !== null && item.itemRating !== undefined;
                const ratedOpt = RATING_OPTIONS.find(r => r.value === item.itemRating);

                return (
                    <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`w-full text-left bg-white rounded-3xl p-4 border shadow-sm transition-all active:scale-[0.98] hover:shadow-md ${
                            isCompleted && !isRated ? 'border-amber-200 shadow-amber-100' : 'border-gray-100'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 flex-shrink-0 ${isRated ? 'border-green-100 grayscale-[20%]' : 'border-amber-100'}`}>
                                <img
                                    src={item.staffAvatar || 'https://i.pravatar.cc/150?img=32'}
                                    alt="KTV"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-800 text-sm leading-tight truncate">{item.service_name}</p>
                                <p className="text-gray-400 text-xs font-medium mt-0.5 truncate">
                                    {item.staffName || item.technicianCode || '—'} · {item.duration} phút
                                </p>
                                {isRated && ratedOpt && (
                                    <p className="text-green-600 text-[11px] font-bold mt-0.5">{ratedOpt.emoji} {lang === 'vi' ? ratedOpt.label : ratedOpt.labelEN}</p>
                                )}
                            </div>

                            {/* Status badge + chevron */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-black ${meta.cls}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                    {meta.label}
                                </div>
                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default ServiceList;
