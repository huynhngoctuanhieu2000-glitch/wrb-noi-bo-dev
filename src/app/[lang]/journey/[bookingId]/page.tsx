'use client';
import React, { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useJourneyRealtime } from '@/components/Journey/useJourneyRealtime';
import WaitingRoom from '@/components/Journey/WaitingRoom';
import ServiceList from '@/components/Journey/ServiceList';
import CheckBelongings from '@/components/Journey/CheckBelongings';
import Feedback from '@/components/Journey/Feedback';
import { translations } from '@/components/Journey/Journey.i18n';
import { useAuthStore } from '@/lib/authStore.logic';

export default function JourneyPage({ params }: { params: Promise<{ lang: string, bookingId: string }> }) {
    const resolvedParams = React.use(params);
    const bookingId = resolvedParams.bookingId;
    const lang = resolvedParams.lang === 'vn' ? 'vi' : resolvedParams.lang;

    const { data: journeyData, loading, error, refresh } = useJourneyRealtime(bookingId);
    const { isAuthUser } = useAuthStore();
    const [isSosLoading, setIsSosLoading] = React.useState(false);
    const [sosSent, setSosSent] = React.useState(false);
    const [isActionLoading, setIsActionLoading] = React.useState(false);
    const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
    const [serviceView, setServiceView] = React.useState<'TIMER' | 'CHECK_BELONGINGS' | 'RATING'>('TIMER');

    // State machine: derive từ booking.status + items status
    const rawStatus = journeyData?.status || 'PREPARING';
    // Log debug
    const itemStatuses = (journeyData?.items || []).map(i => `${i.id}:${i.status}`);
    console.log('[Journey] rawStatus:', rawStatus, '| items:', itemStatuses.join(', '));
    // Bất kỳ item nào có status KHÁC "WAITING"/null → coi booking đã bắt đầu
    const itemsStarted = (journeyData?.items || []).some(i =>
        i.status && i.status !== 'WAITING'
    );
    const derivedStatus = (rawStatus === 'NEW' || rawStatus === 'PREPARING') && itemsStarted
        ? 'IN_PROGRESS'
        : rawStatus === 'NEW' ? 'PREPARING' : rawStatus;
    const state = derivedStatus;

    // Khi rawStatus = PREPARING nhưng items đã Started -> Nghĩa là KTV đang nghỉ giữa chặng (chuyển phòng)
    const isPaused = rawStatus === 'PREPARING' && itemsStarted;

    const t = {
        preparing: translations[lang]?.preparing || translations['en'].preparing,
        inProgress: translations[lang]?.inProgress || translations['en'].inProgress,
        completed: translations[lang]?.completed || translations['en'].completed,
        feedback: translations[lang]?.feedback || translations['en'].feedback,
        title: translations[lang]?.title || translations['en'].title,
        errorTitle: translations[lang]?.errorTitle || translations['en'].errorTitle,
        retry: translations[lang]?.retry || translations['en'].retry,
        finishTitle: translations[lang]?.finishTitle || translations['en'].finishTitle,
        finishSub: translations[lang]?.finishSub || translations['en'].finishSub,
        goHome: translations[lang]?.goHome || translations['en'].goHome,
        sos: translations[lang]?.sos || translations['en'].sos,
        sosConfirm: translations[lang]?.sosConfirm || translations['en'].sosConfirm,
        sosSending: translations[lang]?.sosSending || translations['en'].sosSending,
        sosSent: translations[lang]?.sosSent || translations['en'].sosSent,
        allDoneTitle: lang === 'vi' ? 'Cảm ơn bạn đã đánh giá!' : 'Thank you for your feedback!',
        allDoneSub: lang === 'vi' ? 'Mọi dịch vụ đã hoàn thành. Hẹn gặp lại bạn!' : 'All services completed. See you again!',
    };

    // Progress steps — 4 bước lộ trình đầy đủ
    const steps = [
        {
            id: 'FOOT_SOAK',
            label: translations[lang]?.footSoak || translations['en'].footSoak,
            emoji: '🛁',
        },
        {
            id: 'SERVICE',
            label: translations[lang]?.service || translations['en'].service,
            emoji: '💆',
        },
        {
            id: 'CHECK',
            label: translations[lang]?.checkItems || translations['en'].checkItems,
            emoji: '👜',
        },
        {
            id: 'RATING',
            label: translations[lang]?.rating || translations['en'].rating,
            emoji: '⭐',
        },
    ];

    // Map booking status → stepper index
    const getStepIndex = () => {
        if (state === 'DONE') return steps.length; // all done
        if (state === 'PREPARING') return 0; // Ngâm chân
        if (state === 'COMPLETED' || state === 'FEEDBACK' || state === 'IN_PROGRESS') {
            if (serviceView === 'RATING') return 3;
            if (serviceView === 'CHECK_BELONGINGS') return 2;
            return 1; // TIMER
        }
        return 1;
    };
    const currentIndex = getStepIndex();

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleSOS = async () => {
        if (sosSent || isSosLoading) return;
        const ok = window.confirm(t.sosConfirm);
        if (!ok) return;
        setIsSosLoading(true);
        try {
            const res = await fetch('/api/notifications/emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    customerName: journeyData?.roomName || 'Khách',
                    message: `🚨 KHẨN CẤP: Khách hàng tại PHÒNG ${journeyData?.roomName || '???'}${journeyData?.bedId ? ` - GIƯỜNG ${journeyData.bedId}` : ''} nhấn nút báo động.`
                })
            });
            if (!res.ok) throw new Error('Failed to send SOS');
            setSosSent(true);
            setTimeout(() => setSosSent(false), 5000);
        } catch (err) {
            console.error('SOS Error:', err);
            alert('Gửi yêu cầu thất bại. Vui lòng thử lại hoặc gọi nhân viên.');
        } finally {
            setIsSosLoading(false);
        }
    };

    const handleAddService = async () => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/notifications/normal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    customerName: journeyData?.roomName || 'Khách',
                    message: `🔔 YÊU CẦU: Khách tại PHÒNG ${journeyData?.roomName || '???'}${journeyData?.bedId ? ` - GIƯỜNG ${journeyData.bedId}` : ''} muốn MUA THÊM DỊCH VỤ.`
                })
            });
            if (res.ok) {
                setActionSuccess('ADD_SERVICE');
                setTimeout(() => setActionSuccess(null), 3000);
            }
        } catch (err) { console.error(err); }
        finally { setIsActionLoading(false); }
    };

    const handleChangeStaff = async () => {
        if (isActionLoading) return;
        const ok = window.confirm(lang === 'vi' ? 'Bạn muốn yêu cầu đổi nhân viên?' : 'Do you want to request a staff change?');
        if (!ok) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/notifications/emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    customerName: journeyData?.roomName || 'Khách',
                    message: `🚨 ĐỔI NGƯỜI: Khách tại PHÒNG ${journeyData?.roomName || '???'}${journeyData?.bedId ? ` - GIƯỜNG ${journeyData.bedId}` : ''} yêu cầu ĐỔI NHÂN VIÊN.`
                })
            });
            if (res.ok) {
                setActionSuccess('CHANGE_STAFF');
                setTimeout(() => setActionSuccess(null), 3000);
            }
        } catch (err) { console.error(err); }
        finally { setIsActionLoading(false); }
    };

    // 🆕 Per-item rating handler (supports per-KTV ratings)
    const handleItemRated = useCallback(async (itemId: string, rating: number, feedback: string) => {
        // Strip composite KTV suffix (e.g. 'abc-ktv0' → 'abc') for DB update
        const realItemId = itemId.replace(/-ktv\d+$/, '');
        
        // Extract ktvCode for per-KTV rating
        let ktvCode: string | undefined;
        if (itemId !== realItemId) {
            // This is a composite ID → find the corresponding KTV code
            const matchedItem = journeyData?.items?.find(i => i.id === itemId);
            ktvCode = matchedItem?.technicianCode?.trim() || undefined;
        }

        const res = await fetch('/api/journey/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookingId,
                bookingItemId: realItemId,
                itemRating: rating,
                itemFeedback: feedback || null,
                ktvCode, // Per-KTV rating identifier
                status: 'DONE',
            })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to submit rating');
        }
        // Refresh to update booking status if DONE
        await refresh();
    }, [bookingId, refresh, journeyData?.items]);

    // Handler: CheckBelongings → chuyển sang FEEDBACK
    const handleCheckBelongingsConfirm = useCallback(async () => {
        try {
            const res = await fetch('/api/journey/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, status: 'FEEDBACK' })
            });
            if (!res.ok) throw new Error('Failed to update status');
            await refresh();
        } catch (err) {
            console.error('CheckBelongings confirm error:', err);
        }
    }, [bookingId, refresh]);

    // Handler: Feedback → chuyển sang DONE
    const handleFeedbackComplete = useCallback(async (result: { rating: number, violations: number[], tipAmount: number, feedbackNote?: string }) => {
        try {
            const res = await fetch('/api/journey/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    rating: result.rating,
                    violations: result.violations,
                    tipAmount: result.tipAmount,
                    status: 'DONE'
                })
            });
            if (!res.ok) throw new Error('Failed to submit feedback');
            await refresh();
        } catch (err) {
            console.error('Feedback submit error:', err);
            throw err; // Re-throw so Feedback component can show error
        }
    }, [bookingId, refresh]);

    // ─── Render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans text-amber-500">
                <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center font-sans">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t.errorTitle}</h2>
                <p className="text-gray-500">{error}</p>
                <button onClick={refresh} className="mt-4 px-6 py-2 bg-amber-500 text-white font-bold rounded-xl">{t.retry}</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 pb-10 font-sans selection:bg-amber-200">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex flex-col shadow-sm">
                <div className="flex items-center w-full mb-4">
                    <button className="p-2 -ml-2 text-gray-400 hover:text-gray-800 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h1 className="flex-1 text-center font-bold text-gray-800 text-lg uppercase tracking-widest mr-6">
                        {t.title}
                    </h1>
                </div>

                {/* Progress Stepper — 4 bước */}
                <div className="relative flex justify-between items-center w-full px-2 mt-2">
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 z-0">
                        <div
                            className="h-full bg-amber-400 transition-all duration-700 ease-out"
                            style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>

                    {steps.map((step, index) => {
                        const isCompleted = currentIndex > index;
                        const isActive = currentIndex === index;

                        let colorClass = 'bg-white border-gray-200 text-gray-300';
                        if (isCompleted) colorClass = 'bg-amber-400 border-amber-400 text-white';
                        if (isActive) colorClass = 'bg-amber-50 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]';

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${colorClass}`}>
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    ) : (
                                        <span className="text-lg leading-none">{step.emoji}</span>
                                    )}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto relative px-4 pt-6">
                {state === 'PREPARING' && (
                    <WaitingRoom
                        orderId={journeyData?.id || bookingId}
                        lang={lang}
                        items={journeyData?.items || []}
                        roomName={journeyData?.roomName}
                        bedId={journeyData?.bedId}
                        currentStep={currentIndex}
                    />
                )}

                {(state === 'IN_PROGRESS' || state === 'COMPLETED' || state === 'FEEDBACK') && (
                    <ServiceList
                        items={journeyData?.items || []}
                        lang={lang}
                        bookingId={bookingId}
                        roomName={journeyData?.roomName}
                        bedId={journeyData?.bedId}
                        fallbackStaffName={journeyData?.staffName}
                        fallbackStaffAvatar={journeyData?.staffAvatar}
                        onSOS={handleSOS}
                        isSosLoading={isSosLoading}
                        sosSent={sosSent}
                        isAuthUser={isAuthUser}
                        onAddService={handleAddService}
                        onChangeStaff={handleChangeStaff}
                        isActionLoading={isActionLoading}
                        actionSuccess={actionSuccess}
                        onItemRated={handleItemRated}
                        isPaused={isPaused}
                        onViewChange={setServiceView}
                    />
                )}

                {state === 'DONE' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">{t.allDoneTitle}</h2>
                        <p className="text-gray-500">{t.allDoneSub}</p>
                        <button onClick={() => window.location.href = `/${lang}/customer-type`} className="mt-8 px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-800 shadow-sm hover:bg-gray-50">{t.goHome}</button>
                    </div>
                )}
            </main>
        </div>
    );
}
