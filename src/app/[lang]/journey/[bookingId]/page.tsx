'use client';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useJourneyRealtime } from '@/components/Journey/useJourneyRealtime';
import WaitingRoom from '@/components/Journey/WaitingRoom';
import ActiveService from '@/components/Journey/ActiveService';
import CheckBelongings from '@/components/Journey/CheckBelongings';
import Feedback from '@/components/Journey/Feedback';
import { translations, TranslationKey } from '@/components/Journey/Journey.i18n';



export default function JourneyPage({ params }: { params: Promise<{ lang: string, bookingId: string }> }) {
    const resolvedParams = React.use(params);
    const bookingId = resolvedParams.bookingId;
    const lang = resolvedParams.lang === 'vn' ? 'vi' : resolvedParams.lang;

    // Note: Journey uses a separate simple lang dictionary if needed, 
    // but for now let's just use inline translation based on lang for quick fix, 
    // or pass lang down if dictionary has it.

    const { data: journeyData, loading, error, refresh } = useJourneyRealtime(bookingId);
    const [isSosLoading, setIsSosLoading] = React.useState(false);
    const [sosSent, setSosSent] = React.useState(false);

    // Default to PREPARING if no state is explicitly found, or map NEW to PREPARING
    const rawStatus = journeyData?.status || 'PREPARING';
    let state = rawStatus === 'NEW' ? 'PREPARING' : rawStatus;
    
    // Nếu đơn đã DONE nhưng chưa có rating thì ép về FEEDBACK để khách đánh giá
    if (state === 'DONE' && !journeyData?.rating) {
        state = 'FEEDBACK';
    }

    // Translations for steps
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
        redirecting: translations[lang]?.redirecting || translations['en'].redirecting,
        autoRedirect: translations[lang]?.autoRedirect || translations['en'].autoRedirect,
        spa_service_fallback: translations[lang]?.spa_service_fallback || translations['en'].spa_service_fallback,
        sos: translations[lang]?.sos || translations['en'].sos,
        sosConfirm: translations[lang]?.sosConfirm || translations['en'].sosConfirm,
        sosSending: translations[lang]?.sosSending || translations['en'].sosSending,
        sosSent: translations[lang]?.sosSent || translations['en'].sosSent,
    };



    const steps = [
        {
            id: 'PREPARING',
            label: t.preparing,
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        },
        {
            id: 'IN_PROGRESS',
            label: t.inProgress,
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        },
        {
            id: 'COMPLETED',
            label: t.completed,
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        },
        {
            id: 'FEEDBACK',
            label: t.feedback,
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        }
    ];

    const currentIndex = state === 'DONE' ? steps.length : steps.findIndex(s => s.id === state);

    // Call API to advance journey state
    const advanceNextState = async (nextStatus: string, additionalData: any = {}) => {
        try {
            const res = await fetch('/api/journey/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, status: nextStatus, ...additionalData })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update state');
            }

            // Immediately fetch newest state
            await refresh();
            return true;
        } catch (e) {
            console.error("Failed to advance state:", e);
            throw e; // Re-throw so child components can handle it
        }
    };

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
                    customerName: journeyData?.id || 'Khách hàng',
                    message: `Khách hàng (Booking: ${bookingId}) nhấn nút KHẨN CẤP tại phòng.`
                })
            });

            if (!res.ok) throw new Error('Failed to send SOS');

            setSosSent(true);
            setTimeout(() => setSosSent(false), 5000); // Ẩn trạng thái thành công sau 5s
        } catch (err) {
            console.error('SOS Error:', err);
            alert('Lỗi khi gửi yêu cầu khẩn cấp. Vui lòng thử lại hoặc gọi trực tiếp nhân viên.');
        } finally {
            setIsSosLoading(false);
        }
    };

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

                {/* Progress Stepper */}
                <div className="relative flex justify-between items-center w-full px-2 mt-2">
                    {/* Background Track line */}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 z-0">
                        {/* Fill line */}
                        <div
                            className="h-full bg-amber-400 transition-all duration-700 ease-out"
                            style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>

                    {steps.map((step, index) => {
                        const isCompleted = currentIndex > index;
                        const isActive = currentIndex === index;

                        let colorClass = 'bg-white border-gray-200 text-gray-300'; // Upcoming
                        if (isCompleted) colorClass = 'bg-amber-400 border-amber-400 text-white'; // Done
                        if (isActive) colorClass = 'bg-amber-50 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'; // Current

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${colorClass}`}>
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    ) : step.icon}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-md mx-auto relative px-4 pt-6">
                {state === 'PREPARING' && <WaitingRoom orderId={bookingId} lang={lang} />}

                {/* Active Service requires actual parsing of duration or fallback to demo logic if not mapped in DB yet */}
                {state === 'IN_PROGRESS' && (
                    <ActiveService 
                        serviceName={journeyData?.items?.[0]?.service_name || t.spa_service_fallback} 
                        totalDuration={journeyData?.totalDuration || 90} 
                        timeStart={journeyData?.timeStart || null} 
                        lang={lang} 
                        staffName={journeyData?.staffName}
                        staffAvatar={journeyData?.staffAvatar}
                    />
                )}


                {state === 'COMPLETED' && <CheckBelongings onConfirm={() => advanceNextState('FEEDBACK')} />}

                {state === 'FEEDBACK' && (
                    <Feedback 
                        staffName={journeyData?.staffName}
                        staffAvatar={journeyData?.staffAvatar}
                        serviceName={journeyData?.items?.[0]?.service_name}
                        duration={journeyData?.totalDuration}
                        onComplete={(feedbackData) => advanceNextState('DONE', feedbackData)} 
                    />
                )}

                {state === 'DONE' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">{t.finishTitle}</h2>
                        <p className="text-gray-500">{t.finishSub}</p>
                        <button onClick={() => window.location.href = `/${lang}/customer-type`} className="mt-8 px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-800 shadow-sm hover:bg-gray-50">{t.goHome}</button>
                    </div>
                )}
            </main>

            {/* SOS / Emergency Floating Button */}
            {state !== 'DONE' && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                    {sosSent && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-in slide-in-from-right-full">
                            {t.sosSent}
                        </div>
                    )}
                    <button
                        onClick={handleSOS}
                        disabled={isSosLoading || sosSent}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isSosLoading ? 'bg-gray-400 rotate-12' : sosSent ? 'bg-green-500' : 'bg-red-600 hover:bg-red-700 animate-pulse'
                            }`}
                    >
                        {isSosLoading ? (
                            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                        ) : sosSent ? (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 text-white mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                                <span className="text-[10px] text-white font-black leading-none">{t.sos}</span>
                            </div>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
