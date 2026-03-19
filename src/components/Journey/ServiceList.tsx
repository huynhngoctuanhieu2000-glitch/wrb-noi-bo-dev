'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ServiceItem } from '@/components/Journey/useJourneyRealtime';
import TipModal from '@/components/Journey/TipModal';
import { TIMER_CONFIG_COMPACT, RATING_OPTIONS, getViolations } from './Journey.constants';
import { useServiceTimer, groupItemsByTech, useViolations, GroupedService } from './Journey.logic';
import { translations } from './Journey.i18n';

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
// VIEW 1: Tab Timer — Grouped by technician
// ═══════════════════════════════════════════════════════════════════════════════
const TabTimerView = ({
    items, lang, bookingId, roomName, bedId,
    onSOS, isSosLoading, sosSent, isAuthUser,
    onAddService, onChangeStaff, isActionLoading, actionSuccess,
}: Omit<ServiceListProps, 'onItemRated'>) => {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const t = translations[lang || 'vi'] || translations['en'];

    // Group items by technician
    const groups = groupItemsByTech(items || []);
    const currentGroup = groups[selectedIdx] || groups[0];
    if (!currentGroup) return null;

    const { formattedTime, progress: pct, isStarted, isFinished } = useServiceTimer(currentGroup.totalDuration, currentGroup.earliestTimeStart);
    const circumference = 2 * Math.PI * TIMER_CONFIG_COMPACT.RADIUS;
    const isCompleted = currentGroup.isCompleted;
    const violations = getViolations(lang || 'vi');

    // Use shared violations hook
    const currentGroupId = currentGroup.items[0]?.id || '0';
    const { selectedViolations, sentViolations, sendingViolation, toggleViolation } = useViolations(
        bookingId,
        currentGroupId,
        violations,
        currentGroup.roomName || roomName,
        currentGroup.bedId || bedId,
        currentGroup.combinedName,
    );

    return (
        <div className="flex flex-col w-full pb-6">
            {/* Service Group Tab Bar — hiện per-group */}
            {groups.length > 1 && (
                <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-3 px-1 mb-2 scrollbar-hide snap-x">
                    {groups.map((group, idx) => {
                        const isActive = idx === selectedIdx;
                        const isDone = group.isCompleted;
                        return (
                            <button key={group.technicianCode || idx} onClick={() => setSelectedIdx(idx)}
                                className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-2xl border-2 transition-all text-left ${
                                    isActive ? 'bg-amber-50 border-amber-400 shadow-sm' :
                                    isDone ? 'bg-green-50 border-green-200' :
                                    'bg-white border-gray-100 hover:border-gray-200'
                                }`}>
                                <p className={`text-xs font-black leading-tight truncate max-w-[150px] ${isActive ? 'text-amber-800' : isDone ? 'text-green-700' : 'text-gray-700'}`}>
                                    {group.combinedName}
                                </p>
                                <p className={`text-[10px] font-bold ${isActive ? 'text-amber-500' : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                                    {isDone
                                        ? `✅ ${t.done}`
                                        : `${group.totalDuration} ${t.minutes}${group.itemCount > 1 ? ` · ${group.itemCount} ${t.services}` : ''}`
                                    }
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Timer Circle */}
            <div className="flex flex-col items-center mb-4">
                <div className="relative flex items-center justify-center">
                    <svg className="-rotate-90 drop-shadow-lg" width={TIMER_CONFIG_COMPACT.TIMER_SIZE} height={TIMER_CONFIG_COMPACT.TIMER_SIZE} viewBox="0 0 260 260">
                        <circle cx="130" cy="130" r={TIMER_CONFIG_COMPACT.RADIUS} fill="none" stroke={isStarted ? TIMER_CONFIG_COMPACT.AMBER_LIGHT : '#F3F4F6'} strokeWidth="8" />
                        <circle cx="130" cy="130" r={TIMER_CONFIG_COMPACT.RADIUS} fill="none"
                            stroke={isCompleted ? '#10B981' : isStarted ? TIMER_CONFIG_COMPACT.AMBER_MAIN : '#D1D5DB'}
                            strokeWidth="12" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={isCompleted ? 0 : circumference - (pct / 100) * circumference}
                            className="transition-all duration-1000 ease-linear" />
                    </svg>
                    <div className={`absolute rounded-full flex flex-col items-center justify-center shadow-lg ${
                        isCompleted ? 'bg-green-50' : isStarted ? 'bg-amber-50' : 'bg-gray-50'
                    }`} style={{ width: TIMER_CONFIG_COMPACT.INNER_SIZE, height: TIMER_CONFIG_COMPACT.INNER_SIZE }}>
                        {isCompleted ? (
                            <>
                                <span className="text-4xl">✅</span>
                                <span className="text-sm font-black text-green-700 mt-1">{t.done}</span>
                            </>
                        ) : (
                            <>
                                <span className={`text-5xl font-black tracking-tighter ${isStarted ? 'text-amber-900' : 'text-gray-400'}`}>{formattedTime}</span>
                                {!isStarted && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider animate-pulse">{t.waiting}</span>}
                            </>
                        )}
                    </div>
                </div>

                {/* Service Info — grouped */}
                <div className="text-center mt-3">
                    <p className="font-black text-gray-800 text-lg">{currentGroup.combinedName}</p>
                    <p className="text-gray-400 text-sm font-medium">
                        {currentGroup.technicianCode && `${t.staff}: ${currentGroup.technicianCode}`}
                        {currentGroup.technicianCode && (currentGroup.roomName || roomName) && ' · '}
                        {(currentGroup.roomName || roomName) && `${t.room} ${currentGroup.roomName || roomName}`}
                        {(currentGroup.bedId || bedId) && ` · ${t.bed} ${currentGroup.bedId || bedId}`}
                    </p>
                    {currentGroup.itemCount > 1 && (
                        <p className="text-xs font-bold text-amber-500 mt-1">
                            {currentGroup.totalDuration} {t.minutes} · {currentGroup.itemCount} {t.services}
                        </p>
                    )}
                </div>

                {/* Progress: X/N groups */}
                {groups.length > 1 && (
                    <p className="text-xs font-bold text-gray-400 mt-2">
                        {selectedIdx + 1} / {groups.length} {t.serviceGroups}
                    </p>
                )}
            </div>

            {/* Quick Violations */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="font-bold text-gray-700 text-sm">{t.quickFeedback}</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        {t.optional}
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
                                {isSent && <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">{t.sent}</span>}
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
                        {actionSuccess === 'ADD_SERVICE' ? '✓ ' : '+ '}{actionSuccess === 'ADD_SERVICE' ? t.notified : t.addServiceShort}
                    </button>
                    {isAuthUser && (
                        <button onClick={onChangeStaff} disabled={isActionLoading || actionSuccess === 'CHANGE_STAFF'}
                            className={`py-4 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border-2 active:scale-95 ${
                                actionSuccess === 'CHANGE_STAFF' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-800 border-gray-100'
                            }`}>
                            {actionSuccess === 'CHANGE_STAFF' ? '✓ ' : '🔄 '}{actionSuccess === 'CHANGE_STAFF' ? t.notified : t.changeStaffShort}
                        </button>
                    )}
                </div>
                <button onClick={onSOS} disabled={isSosLoading || sosSent}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                        isSosLoading ? 'bg-gray-200 text-gray-400' : sosSent ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                    }`}>
                    {sosSent ? '✓ ' : '🚨 '}<span className="tracking-widest uppercase">{sosSent ? t.sosSentBtn : t.sosBtn}</span>
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2: Check Belongings
// ═══════════════════════════════════════════════════════════════════════════════
const CheckBelongingsView = ({ lang = 'vi', onConfirm }: { lang?: string; onConfirm: () => void }) => {
    const t = translations[lang || 'vi'] || translations['en'];
    const checkItems = [t.checkPhone, t.checkWallet, t.checkWatch, t.checkKeys];

    return (
        <div className="flex flex-col items-center w-full py-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-4xl border-2 border-amber-100 mb-6 shadow-lg">
                👜
            </div>
            <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
                {t.beforeYouLeave}
            </h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-8 max-w-xs">
                {t.checkBeforeLeave}
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
                {t.checkedRateNow}
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
    const [savedViolations, setSavedViolations] = useState<number[]>([]);
    const t = translations[lang || 'vi'] || translations['en'];

    // Read violations from localStorage (saved by TabTimerView)
    const storageKey = `spa_wrb_violations_${bookingId || 'default'}`;
    const violations = getViolations(lang || 'vi');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setSavedViolations(JSON.parse(saved));
        } catch { /* silent */ }
    }, [storageKey]);

    const ratedCount = items.filter(i => (i.itemRating !== null && i.itemRating !== undefined) || submitted.has(i.id)).length;
    const allRated = ratedCount >= items.length;

    // Clean up localStorage when all rated
    useEffect(() => {
        if (allRated) {
            try { localStorage.removeItem(storageKey); } catch { /* silent */ }
        }
    }, [allRated, storageKey]);

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
                    {t.rateTitle}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {t.rateSub}
                </p>
            </div>

            {/* Violations Checklist — full 6 questions, editable */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h3 className="text-sm font-black text-amber-800">
                        {t.violationsSectionTitle}
                    </h3>
                </div>
                <div className="space-y-2">
                    {violations.map((v, idx) => {
                        const isChecked = savedViolations.includes(idx);
                        return (
                            <div key={idx}
                                onClick={() => {
                                    const updated = isChecked
                                        ? savedViolations.filter(i => i !== idx)
                                        : [...savedViolations, idx];
                                    setSavedViolations(updated);
                                    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { /* silent */ }
                                }}
                                className={`flex items-start gap-3 p-3 bg-white rounded-2xl cursor-pointer border transition-all ${
                                    isChecked ? 'border-amber-300 shadow-sm ring-1 ring-amber-100' : 'border-gray-100/80'
                                }`}>
                                <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                    isChecked ? 'border-amber-500 bg-amber-500' : 'border-gray-300 bg-white'
                                }`}>
                                    {isChecked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-xs leading-snug font-medium flex-1 ${isChecked ? 'text-amber-900' : 'text-gray-500'}`}>{v}</span>
                            </div>
                        );
                    })}
                </div>
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
                    {ratedCount}/{items.length} {t.rated}
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
                                        {item.technicianCode && `${t.staff}: ${item.technicianCode} · `}{item.duration} {t.minutes}
                                    </p>
                                </div>
                                {isRated ? (
                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                                        <span className="text-lg leading-none">{ratedOpt?.emoji || '⭐'}</span>
                                        <span className="text-[10px] font-black">{t.ratedSent}</span>
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
                                        {t.yourExperience}
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
                                            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>{t.submitting}</>
                                            : ratings[item.id] ? t.submitRating : t.selectToSubmit}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Skip Button — only show if not all rated yet */}
            {!allRated && (
                <button
                    onClick={async () => {
                        const unrated = items.filter(i =>
                            (i.itemRating === null || i.itemRating === undefined) && !submitted.has(i.id)
                        );
                        setSubmitting('__skip__');
                        try {
                            for (const item of unrated) {
                                await onItemRated(item.id, 0, 'skipped');
                            }
                            setSubmitted(prev => {
                                const next = new Set(prev);
                                unrated.forEach(i => next.add(i.id));
                                return next;
                            });
                        } catch { /* noop */ }
                        finally { setSubmitting(null); }
                    }}
                    disabled={!!submitting}
                    className="w-full py-3 mt-4 rounded-2xl font-bold text-sm text-gray-400 bg-white border-2 border-gray-100 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {submitting === '__skip__' ? (
                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>{t.processing}</>
                    ) : (
                        <>{t.skipRating}</>
                    )}
                </button>
            )}

            {/* All-done message */}
            {allRated && (
                <div className="mt-6 text-center animate-in fade-in zoom-in-95">
                    <p className="text-green-600 font-black text-lg">{t.thankYou}</p>
                    <p className="text-gray-400 text-sm mt-1">{t.allDoneRedirecting}</p>
                </div>
            )}

            {/* TipModal */}
            {showTipFor && <TipModal onClose={handleTipClose} lang={lang} />}
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
