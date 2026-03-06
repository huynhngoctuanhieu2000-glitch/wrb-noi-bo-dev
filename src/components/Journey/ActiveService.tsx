'use client';

import React, { useEffect, useState } from 'react';

interface ActiveServiceProps {
    serviceName: string;
    totalDuration: number; // in minutes
    timeStart?: string | null;
    timeEnd?: string | null;
    lang?: string;
}

export default function ActiveService({ serviceName, totalDuration, timeStart, timeEnd, lang = 'vi' }: ActiveServiceProps) {
    const totalSeconds = totalDuration * 60;

    // Calculate initial elapsed time
    const getInitialElapsed = () => {
        if (!timeStart) return 0;
        const start = new Date(timeStart).getTime();

        // If the service is already marked as ended, calculate total spent time instead of ticking
        if (timeEnd) {
            const end = new Date(timeEnd).getTime();
            const diffInSeconds = Math.floor((end - start) / 1000);
            return Math.max(0, Math.min(diffInSeconds, totalSeconds));
        }

        const now = new Date().getTime();
        const diffInSeconds = Math.floor((now - start) / 1000);
        return Math.max(0, Math.min(diffInSeconds, totalSeconds));
    };

    const [elapsedSeconds, setElapsedSeconds] = useState(getInitialElapsed());

    // Update elapsed if start time changes from realtime
    useEffect(() => {
        setElapsedSeconds(getInitialElapsed());
    }, [timeStart, timeEnd, totalSeconds]);

    // Checkbox state for violations mid-service
    const vnViolations = [
        "1. Nhân viên sử dụng điện thoại riêng trong giờ làm?",
        "2. Nhân viên gợi ý hoặc xin tiền thưởng (tip)?",
        "3. Nhân viên nói chuyện riêng quá nhiều?",
        "4. Nhân viên thực hiện sai quy trình?",
        "5. Nhân viên không sắp xếp và bảo quản đồ của khách?",
        "6. Nhân viên có thông báo bấm giờ khi bắt đầu dịch vụ không?"
    ];
    const enViolations = [
        "1. Therapist using personal phone during service?",
        "2. Therapist hinting or asking for a tip?",
        "3. Therapist talking too much?",
        "4. Therapist not following the core process?",
        "5. Therapist not arranging/safeguarding my belongings?",
        "6. Did the therapist notify when the timer started?"
    ];
    const violations = lang === 'vi' ? vnViolations : enViolations;

    const t = {
        activeService: lang === 'vi' ? 'Dịch vụ đang thực hiện' : 'Service in Progress',
        elapsed: lang === 'vi' ? 'Thời gian đã trôi qua' : 'Time Elapsed',
        remaining: lang === 'vi' ? 'Còn lại' : 'Remaining',
        min: lang === 'vi' ? 'phút' : 'mins',
        feedbackTitle: lang === 'vi' ? 'Góp ý nhanh để KTV sửa lỗi:' : 'Quick feedback to correct Therapist:',
        optional: lang === 'vi' ? '(Tùy chọn)' : '(Optional)',
        therapistLabel: lang === 'vi' ? 'Nhân viên' : 'Therapist',
        addService: lang === 'vi' ? 'Thêm dịch vụ' : 'Add Service',
        changeTherapist: lang === 'vi' ? 'Đổi nhân viên' : 'Change Therapist'
    };
    const [selectedViolations, setSelectedViolations] = useState<number[]>([]);

    const toggleViolation = (index: number) => {
        setSelectedViolations(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(prev => Math.min(prev + 1, totalSeconds));
        }, 1000);
        return () => clearInterval(interval);
    }, [totalSeconds]);

    const remainingSeconds = totalSeconds - elapsedSeconds;
    const progress = (remainingSeconds / totalSeconds) * 100;
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingSecs = remainingSeconds % 60;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    const formattedTime = `${remainingMinutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in duration-500 min-h-[80vh] justify-center py-10">
            <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-12">{t.activeService}</h2>

            {/* Circular Progress Indicator */}
            <div className="relative flex items-center justify-center mb-10">
                {/* SVG Ring */}
                <svg className="absolute w-[300px] h-[300px] -rotate-90 transform drop-shadow-xl" viewBox="0 0 280 280">
                    <circle
                        cx="140" cy="140" r={radius}
                        fill="none"
                        stroke="#FFFBEB"
                        strokeWidth="8"
                    />
                    <circle
                        cx="140" cy="140" r={radius}
                        fill="none"
                        stroke="#F59E0B" // amber-500
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                {/* Inner Content (Timer) */}
                <div className="w-[200px] h-[200px] rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.2)] bg-amber-50 flex items-center justify-center">
                    <span className="text-6xl font-black tracking-tighter text-amber-900">{formattedTime}</span>
                </div>
            </div>

            {/* Timers & Info */}
            <div className="text-center mb-10 border-b border-gray-100 pb-10 w-full max-w-sm">
                <h1 className="text-3xl font-black text-gray-800 mb-2">{serviceName}</h1>
            </div>

            {/* Real-time violations report for Staff course-correction */}
            <div className="w-full max-w-sm mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-800 font-bold text-base">{t.feedbackTitle}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">{t.optional}</span>
                </div>
                <div className="space-y-3">
                    {violations.map((v, idx) => (
                        <div key={idx}
                            onClick={() => toggleViolation(idx)}
                            className={`flex items-start gap-4 p-4 bg-white rounded-3xl cursor-pointer transition-shadow shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-md`}
                        >
                            <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedViolations.includes(idx) ? 'border-amber-500 bg-amber-500' : 'border-gray-300 bg-white'}`}>
                                {selectedViolations.includes(idx) && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                )}
                            </div>
                            <span className={`text-sm leading-snug font-medium pr-2 ${selectedViolations.includes(idx) ? 'text-amber-900' : 'text-gray-500'}`}>{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Therapist Info & Actions */}

            <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl overflow-hidden flex-shrink-0">
                        {/* Mock Avatar */}
                        <img src="https://i.pravatar.cc/150?img=32" alt="Therapist" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-0.5">{t.therapistLabel}</span>
                        <span className="text-lg font-bold text-gray-800">NV008 - Mai Anh</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-[0_5px_15px_rgba(245,158,11,0.3)] hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        {t.addService}
                    </button>
                    <button className="py-4 bg-white text-gray-800 border-2 border-gray-100 font-bold rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        {t.changeTherapist}
                    </button>
                </div>

            </div>
        </div>
    );
}
