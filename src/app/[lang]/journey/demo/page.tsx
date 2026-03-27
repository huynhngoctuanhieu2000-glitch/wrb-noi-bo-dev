'use client';
import React, { useState } from 'react';
import WaitingRoom from '@/components/Journey/WaitingRoom';
import ActiveService from '@/components/Journey/ActiveService';
import CheckBelongings from '@/components/Journey/CheckBelongings';
import Feedback from '@/components/Journey/Feedback';

type JourneyState = 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'FEEDBACK' | 'DONE';

export default function JourneyDemoPage() {
    const [state, setState] = useState<JourneyState>('PREPARING');

    const steps = [
        {
            id: 'PREPARING',
            label: 'Chờ phòng',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        },
        {
            id: 'IN_PROGRESS',
            label: 'Đang làm',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        },
        {
            id: 'COMPLETED',
            label: 'Kiểm đồ',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        },
        {
            id: 'FEEDBACK',
            label: 'Đánh giá',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        }
    ];

    const currentIndex = state === 'DONE' ? steps.length : steps.findIndex(s => s.id === state);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 pb-10 font-sans selection:bg-amber-200">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex flex-col shadow-sm">
                <div className="flex items-center w-full mb-4">
                    <button className="p-2 -ml-2 text-gray-400 hover:text-gray-800 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h1 className="flex-1 text-center font-bold text-gray-800 text-lg uppercase tracking-widest mr-6">
                        Hành trình thư giãn
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
                            <div
                                key={step.id}
                                className="flex flex-col items-center gap-2 relative z-10 cursor-pointer"
                                onClick={() => setState(step.id as JourneyState)} // Clickable for demo purpose
                            >
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
                {state === 'PREPARING' && <WaitingRoom orderId="NH-DEMO-2026" />}
                {state === 'IN_PROGRESS' && <ActiveService 
                    items={[{
                        id: 'demo-1',
                        serviceId: 's1',
                        service_name: 'Deep Tissue Release',
                        duration: 90,
                        technicianCode: 'KTV01',
                        staffName: 'KTV Demo',
                        staffAvatar: '',
                        computedTimeStart: null,
                        quantity: 1,
                        price: 0,
                        status: 'IN_PROGRESS',
                        itemRating: null,
                        itemFeedback: null,
                        roomName: 'Phòng Demo',
                        bedId: 'Giường 1'
                    }]}
                    totalDuration={90} 
                />}
                {state === 'COMPLETED' && <CheckBelongings onConfirm={() => setState('FEEDBACK')} />}
                {state === 'FEEDBACK' && <Feedback onComplete={(data) => { console.log('Feedback submitted:', data); setState('DONE'); }} />}

                {state === 'DONE' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Hoàn tất!</h2>
                        <p className="text-gray-500">Cảm ơn bạn đã trải nghiệm dịch vụ.</p>
                        <button onClick={() => setState('PREPARING')} className="mt-8 px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-800 shadow-sm hover:bg-gray-50">Thử lại luồng</button>
                    </div>
                )}
            </main>
        </div>
    );
}
