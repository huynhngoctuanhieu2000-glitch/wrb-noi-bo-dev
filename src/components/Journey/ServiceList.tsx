'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceItem } from '@/components/Journey/useJourneyRealtime';
import TipModal from '@/components/Journey/TipModal';

// 🔧 UI CONFIGURATION
const TIMER_SIZE = 260;
const INNER_SIZE = 180;
const RADIUS = 110;
const AMBER_MAIN = '#F59E0B';
const AMBER_LIGHT = '#FFFBEB';

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
    '4. Therapist not following the correct procedure?',
    '5. Therapist not safeguarding your belongings?',
    '6. Did the therapist notify when starting the timer?',
];

const RATING_OPTIONS = [
    { value: 1, emoji: '😡', label: 'Tệ', labelEN: 'Bad', bg: 'bg-red-100 border-red-400', bgSel: 'bg-red-200 border-red-500 scale-105 shadow-md' },
    { value: 2, emoji: '😐', label: 'OK', labelEN: 'Ok', bg: 'bg-gray-50 border-gray-200', bgSel: 'bg-gray-200 border-gray-500 scale-105 shadow-md' },
    { value: 3, emoji: '🙂', label: 'Tốt', labelEN: 'Good', bg: 'bg-amber-50 border-amber-200', bgSel: 'bg-amber-200 border-amber-500 scale-105 shadow-md' },
    { value: 4, emoji: '🤩', label: 'Xuất sắc', labelEN: 'Excellent', bg: 'bg-amber-100 border-amber-300', bgSel: 'bg-amber-300 border-amber-600 scale-105 shadow-md' },
];

// ─── Timer Hook ───────────────────────────────────────────────────────────────
const useServiceTimer = (duration: number, computedTimeStart: string | null | undefined) => {
    const totalSeconds = duration * 60;
    const getElapsed = () => {
        if (!computedTimeStart) return 0;
        let norm = computedTimeStart;
        if (!norm.includes('Z') && !norm.includes('+')) norm = norm.replace(' ', 'T') + 'Z';
        return Math.max(0, Math.min(Math.floor((Date.now() - new Date(norm).getTime()) / 1000), totalSeconds));
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
    return { formattedTime: `${mm}:${ss}`, pct, isStarted: !!computedTimeStart, isFinished: remaining <= 0 && !!computedTimeStart };
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

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1: Tab Timer — Giống ActiveService cũ
// ═══════════════════════════════════════════════════════════════════════════════
const TabTimerView = ({
    items, lang, bookingId, roomName, bedId,
    onSOS, isSosLoading, sosSent, isAuthUser,
    onAddService, onChangeStaff, isActionLoading, actionSuccess,
}: Omit<ServiceListProps, 'onItemRated'>) => {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [selectedViolations, setSelectedViolations] = useState<number[]>([]);
    const [sentViolations, setSentViolations] = useState<Set<number>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    const current = items[selectedIdx] || items[0];
    if (!current) return null;

    const { formattedTime, pct, isStarted, isFinished } = useServiceTimer(current.duration, current.computedTimeStart);
    const circumference = 2 * Math.PI * RADIUS;
    const isCompleted = current.status === 'COMPLETED' || current.status === 'DONE';
    const violations = lang === 'vi' ? VIOLATIONS_VI : VIOLATIONS_EN;

    const sendViolation = async (idx: number) => {
        if (sentViolations.has(idx)) return;
        setSentViolations(prev => new Set([...prev, idx]));
        try {
            await fetch('/api/notifications/normal', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId, type: 'FEEDBACK',
                    message: `⚠️ Khách${roomName ? ` P.${roomName}` : ''} - DV "${current.service_name}": ${violations[idx]}`,
                }),
            });
        } catch { /* silent */ }
    };

    const toggleViolation = (idx: number) => {
        const isSelecting = !selectedViolations.includes(idx);
        setSelectedViolations(prev => isSelecting ? [...prev, idx] : prev.filter(i => i !== idx));
        if (isSelecting) sendViolation(idx);
    };

    return (
        <div className="flex flex-col w-full pb-6">
            {/* Service Tab Bar */}
            {items.length > 1 && (
                <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-3 px-1 mb-2 scrollbar-hide snap-x">
                    {items.map((item, idx) => {
                        const isActive = idx === selectedIdx;
                        const isDone = item.status === 'COMPLETED' || item.status === 'DONE';
                        return (
                            <button key={item.id} onClick={() => setSelectedIdx(idx)}
                                className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-2xl border-2 transition-all text-left ${
                                    isActive ? 'bg-amber-50 border-amber-400 shadow-sm' :
                                    isDone ? 'bg-green-50 border-green-200' :
                                    'bg-white border-gray-100 hover:border-gray-200'
                                }`}>
                                <p className={`text-xs font-black leading-tight truncate max-w-[120px] ${isActive ? 'text-amber-800' : isDone ? 'text-green-700' : 'text-gray-700'}`}>
                                    {item.service_name}
                                </p>
                                <p className={`text-[10px] font-bold ${isActive ? 'text-amber-500' : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                                    {isDone ? (lang === 'vi' ? '✅ Xong' : '✅ Done') : `${item.duration} ${lang === 'vi' ? 'phút' : 'min'}`}
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Timer Circle */}
            <div className="flex flex-col items-center mb-4">
                <div className="relative flex items-center justify-center">
                    <svg className="-rotate-90 drop-shadow-lg" width={TIMER_SIZE} height={TIMER_SIZE} viewBox="0 0 260 260">
                        <circle cx="130" cy="130" r={RADIUS} fill="none" stroke={isStarted ? AMBER_LIGHT : '#F3F4F6'} strokeWidth="8" />
                        <circle cx="130" cy="130" r={RADIUS} fill="none"
                            stroke={isCompleted ? '#10B981' : isStarted ? AMBER_MAIN : '#D1D5DB'}
                            strokeWidth="12" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={isCompleted ? 0 : circumference - (pct / 100) * circumference}
                            className="transition-all duration-1000 ease-linear" />
                    </svg>
                    <div className={`absolute rounded-full flex flex-col items-center justify-center shadow-lg ${
                        isCompleted ? 'bg-green-50' : isStarted ? 'bg-amber-50' : 'bg-gray-50'
                    }`} style={{ width: INNER_SIZE, height: INNER_SIZE }}>
                        {isCompleted ? (
                            <>
                                <span className="text-4xl">✅</span>
                                <span className="text-sm font-black text-green-700 mt-1">{lang === 'vi' ? 'Hoàn thành' : 'Done'}</span>
                            </>
                        ) : (
                            <>
                                <span className={`text-5xl font-black tracking-tighter ${isStarted ? 'text-amber-900' : 'text-gray-400'}`}>{formattedTime}</span>
                                {!isStarted && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider animate-pulse">{lang === 'vi' ? 'Chờ bắt đầu' : 'Waiting'}</span>}
                            </>
                        )}
                    </div>
                </div>

                {/* Service Info — hiện mã NV per-item */}
                <div className="text-center mt-3">
                    <p className="font-black text-gray-800 text-lg">{current.service_name}</p>
                    <p className="text-gray-400 text-sm font-medium">
                        {current.technicianCode && `NV: ${current.technicianCode}`}
                        {current.technicianCode && roomName && ' · '}
                        {roomName && `${lang === 'vi' ? 'Phòng' : 'Room'} ${roomName}`}
                        {bedId && ` · ${lang === 'vi' ? 'Giường' : 'Bed'} ${bedId}`}
                    </p>
                </div>

                {/* Progress: X/N services */}
                {items.length > 1 && (
                    <p className="text-xs font-bold text-gray-400 mt-2">
                        {selectedIdx + 1} / {items.length} {lang === 'vi' ? 'dịch vụ' : 'services'}
                    </p>
                )}
            </div>

            {/* Quick Violations */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="font-bold text-gray-700 text-sm">{lang === 'vi' ? 'Góp ý nhanh' : 'Quick feedback'}</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        {lang === 'vi' ? 'Tùy chọn' : 'Optional'}
                    </span>
                </div>
                <div className="space-y-2">
                    {violations.map((v, idx) => {
                        const isSel = selectedViolations.includes(idx);
                        const isSent = sentViolations.has(idx);
                        return (
                            <div key={idx} onClick={() => toggleViolation(idx)}
                                className={`flex items-start gap-3 p-3 bg-white rounded-2xl cursor-pointer border transition-all ${
                                    isSent ? 'border-green-200 bg-green-50/30' : isSel ? 'border-amber-200' : 'border-gray-100'
                                }`}>
                                <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center ${
                                    isSent ? 'border-green-500 bg-green-500' : isSel ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                                }`}>
                                    {(isSel || isSent) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-xs leading-snug font-medium flex-1 ${isSent ? 'text-green-700' : isSel ? 'text-amber-900' : 'text-gray-500'}`}>{v}</span>
                                {isSent && <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">{lang === 'vi' ? 'Đã báo' : 'Sent'}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onAddService} disabled={isActionLoading || actionSuccess === 'ADD_SERVICE'}
                        className={`py-4 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                            actionSuccess === 'ADD_SERVICE' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}>
                        {actionSuccess === 'ADD_SERVICE' ? '✓ ' : '+ '}{lang === 'vi' ? (actionSuccess === 'ADD_SERVICE' ? 'Đã báo' : 'Thêm DV') : (actionSuccess === 'ADD_SERVICE' ? 'Notified' : 'Add Service')}
                    </button>
                    {isAuthUser && (
                        <button onClick={onChangeStaff} disabled={isActionLoading || actionSuccess === 'CHANGE_STAFF'}
                            className={`py-4 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border-2 active:scale-95 ${
                                actionSuccess === 'CHANGE_STAFF' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-800 border-gray-100'
                            }`}>
                            {actionSuccess === 'CHANGE_STAFF' ? '✓ ' : '🔄 '}{lang === 'vi' ? (actionSuccess === 'CHANGE_STAFF' ? 'Đã báo' : 'Đổi NV') : (actionSuccess === 'CHANGE_STAFF' ? 'Notified' : 'Change')}
                        </button>
                    )}
                </div>
                <button onClick={onSOS} disabled={isSosLoading || sosSent}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                        isSosLoading ? 'bg-gray-200 text-gray-400' : sosSent ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                    }`}>
                    {sosSent ? '✓ ' : '🚨 '}<span className="tracking-widest uppercase">{lang === 'vi' ? (sosSent ? 'ĐÃ BÁO LỄ TÂN' : 'BÁO KHẨN CẤP') : (sosSent ? 'RECEPTION NOTIFIED' : 'EMERGENCY SOS')}</span>
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2: Check Belongings
// ═══════════════════════════════════════════════════════════════════════════════
const CheckBelongingsView = ({ lang = 'vi', onConfirm }: { lang?: string; onConfirm: () => void }) => {
    const checkItems = lang === 'vi'
        ? ['📱 Điện thoại', '👛 Ví tiền', '⌚ Đồng hồ / Trang sức', '🔑 Chìa khóa / Thẻ']
        : ['📱 Phone', '👛 Wallet', '⌚ Watch / Jewelry', '🔑 Keys / Cards'];

    return (
        <div className="flex flex-col items-center w-full py-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-4xl border-2 border-amber-100 mb-6 shadow-lg">
                👜
            </div>
            <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
                {lang === 'vi' ? 'Nhắc nhở trước khi ra về' : 'Before You Leave'}
            </h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-8 max-w-xs">
                {lang === 'vi'
                    ? 'Vui lòng kiểm tra kỹ tư trang cá nhân trước khi rời phòng!'
                    : 'Please check your personal belongings before leaving!'}
            </p>
            <div className="w-full space-y-3 mb-8">
                {checkItems.map((item) => (
                    <div key={item} className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
                        <span className="font-bold text-gray-800 text-base">{item}</span>
                    </div>
                ))}
            </div>
            <button onClick={onConfirm}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-base shadow-xl active:scale-95 transition-all">
                {lang === 'vi' ? '✅ Đã kiểm tra — Tiến hành đánh giá' : '✅ Checked — Rate Now'}
            </button>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3: Combined Rating — Tất cả NV gộp 1 trang
// ═══════════════════════════════════════════════════════════════════════════════
const CombinedRatingView = ({
    items, lang = 'vi', bookingId, onItemRated,
}: {
    items: ServiceItem[]; lang?: string; bookingId: string;
    onItemRated: (itemId: string, rating: number, feedback: string) => Promise<void>;
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<Set<string>>(new Set());
    const [showTipFor, setShowTipFor] = useState<string | null>(null);

    const ratedCount = items.filter(i => (i.itemRating !== null && i.itemRating !== undefined) || submitted.has(i.id)).length;
    const allRated = ratedCount >= items.length;

    const handleSubmit = async (itemId: string) => {
        const rating = ratings[itemId];
        if (!rating || submitting) return;

        // If excellent → show tip popup first
        if (rating === 4) {
            setShowTipFor(itemId);
            return;
        }

        setSubmitting(itemId);
        try {
            await onItemRated(itemId, rating, '');
            setSubmitted(prev => new Set([...prev, itemId]));
            setExpandedId(null);
        } catch { /* noop */ }
        finally { setSubmitting(null); }
    };

    const handleTipClose = async (tipAmount: number) => {
        const itemId = showTipFor;
        setShowTipFor(null);
        if (!itemId) return;

        setSubmitting(itemId);
        try {
            await onItemRated(itemId, 4, `tip:${tipAmount}`);
            setSubmitted(prev => new Set([...prev, itemId]));
            setExpandedId(null);
        } catch { /* noop */ }
        finally { setSubmitting(null); }
    };

    return (
        <div className="flex flex-col w-full py-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border-2 border-amber-200">
                    ⭐
                </div>
                <h2 className="text-xl font-black text-gray-800">
                    {lang === 'vi' ? 'Đánh giá dịch vụ' : 'Rate Your Services'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {lang === 'vi'
                        ? 'Đánh giá từng dịch vụ để chúng tôi cải thiện tốt hơn'
                        : 'Rate each service to help us improve'}
                </p>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3 mb-5">
                <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                            style={{ width: `${(ratedCount / items.length) * 100}%` }} />
                    </div>
                </div>
                <span className="text-xs font-black text-gray-500 whitespace-nowrap">
                    {ratedCount}/{items.length} {lang === 'vi' ? 'đã đánh giá' : 'rated'}
                </span>
            </div>

            {/* Staff Cards */}
            <div className="space-y-3">
                {items.map((item) => {
                    const isExpanded = expandedId === item.id;
                    const isRated = (item.itemRating !== null && item.itemRating !== undefined) || submitted.has(item.id);
                    const ratingValue = ratings[item.id] || item.itemRating;
                    const ratedOpt = RATING_OPTIONS.find(r => r.value === ratingValue);
                    const isSubmittingThis = submitting === item.id;

                    return (
                        <div key={item.id} className={`bg-white rounded-3xl border-2 transition-all overflow-hidden ${
                            isRated ? 'border-green-100' : isExpanded ? 'border-amber-300 shadow-md' : 'border-gray-100'
                        }`}>
                            {/* Accordion Header — chỉ hiện tên dịch vụ, ẩn NV */}
                            <button onClick={() => !isRated && setExpandedId(isExpanded ? null : item.id)}
                                className="w-full text-left p-4 flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                    isRated ? 'bg-green-50 border-2 border-green-100' : 'bg-amber-50 border-2 border-amber-100'
                                }`}>
                                    {isRated ? '✅' : '💆'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-800 text-sm leading-tight truncate">
                                        {item.service_name}
                                    </p>
                                    <p className="text-gray-400 text-xs font-medium truncate">
                                        {item.technicianCode && `NV: ${item.technicianCode} · `}{item.duration} {lang === 'vi' ? 'phút' : 'min'}
                                    </p>
                                </div>
                                {isRated ? (
                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                                        <span className="text-lg leading-none">{ratedOpt?.emoji || '⭐'}</span>
                                        <span className="text-[10px] font-black">{lang === 'vi' ? 'Đã gửi' : 'Sent'}</span>
                                    </div>
                                ) : (
                                    <svg className={`w-5 h-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>

                            {/* Expanded Rating Area */}
                            {isExpanded && !isRated && (
                                <div className="px-4 pb-4 border-t border-gray-50 pt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm font-bold text-gray-700 mb-3">
                                        {lang === 'vi' ? 'Trải nghiệm của bạn?' : 'Your experience?'}
                                    </p>
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {RATING_OPTIONS.map((opt) => (
                                            <button key={opt.value}
                                                onClick={() => setRatings(prev => ({ ...prev, [item.id]: opt.value }))}
                                                className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all active:scale-95 ${
                                                    ratings[item.id] === opt.value ? opt.bgSel : opt.bg
                                                }`}>
                                                <span className="text-2xl mb-0.5">{opt.emoji}</span>
                                                <span className="text-[10px] font-bold leading-tight text-center text-gray-700">
                                                    {lang === 'vi' ? opt.label : opt.labelEN}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => handleSubmit(item.id)}
                                        disabled={!ratings[item.id] || isSubmittingThis}
                                        className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                            ratings[item.id] && !isSubmittingThis
                                                ? 'bg-gray-900 text-white shadow-md active:scale-95'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}>
                                        {isSubmittingThis
                                            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>{lang === 'vi' ? 'Đang gửi...' : 'Submitting...'}</>
                                            : ratings[item.id] ? (lang === 'vi' ? 'Gửi đánh giá' : 'Submit') : (lang === 'vi' ? 'Chọn mức độ để gửi' : 'Select to submit')}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* All-done message */}
            {allRated && (
                <div className="mt-6 text-center animate-in fade-in zoom-in-95">
                    <p className="text-green-600 font-black text-lg">🎉 {lang === 'vi' ? 'Cảm ơn bạn đã đánh giá!' : 'Thank you for your feedback!'}</p>
                    <p className="text-gray-400 text-sm mt-1">{lang === 'vi' ? 'Đang chuyển hướng...' : 'Redirecting...'}</p>
                </div>
            )}

            {/* TipModal */}
            {showTipFor && <TipModal onClose={handleTipClose} />}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — State machine
// ═══════════════════════════════════════════════════════════════════════════════
type ViewState = 'TIMER' | 'CHECK_BELONGINGS' | 'RATING';

const ServiceList = (props: ServiceListProps) => {
    const { items, lang = 'vi' } = props;
    const [view, setView] = useState<ViewState>('TIMER');

    // Auto-transition: TIMER → CHECK_BELONGINGS when all items completed
    const allCompleted = items.length > 0 && items.every(i =>
        ['COMPLETED', 'DONE', 'CLEANING'].includes(i.status || '')
    );
    const allRated = items.length > 0 && items.every(i =>
        i.itemRating !== null && i.itemRating !== undefined
    );

    useEffect(() => {
        if (allCompleted && view === 'TIMER') {
            setView('CHECK_BELONGINGS');
        }
    }, [allCompleted, view]);

    return (
        <div className="w-full">
            {view === 'TIMER' && <TabTimerView {...props} />}
            {view === 'CHECK_BELONGINGS' && (
                <CheckBelongingsView lang={lang} onConfirm={() => setView('RATING')} />
            )}
            {view === 'RATING' && (
                <CombinedRatingView
                    items={items}
                    lang={lang}
                    bookingId={props.bookingId}
                    onItemRated={props.onItemRated}
                />
            )}
        </div>
    );
};

export default ServiceList;
