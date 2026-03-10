'use client';

import React, { useState } from 'react';
import TipModal from '@/components/Journey/TipModal';

interface FeedbackProps {
    onComplete: (result: { rating: number, violations: number[], tipAmount: number }) => void;
    staffName?: string;
    staffAvatar?: string;
    serviceName?: string;
    duration?: number;
}

export default function Feedback({ 
    onComplete, 
    staffName, 
    staffAvatar, 
    serviceName, 
    duration 
}: FeedbackProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [showTip, setShowTip] = useState(false);
    const [isViolationsOpen, setIsViolationsOpen] = useState(false);

    // Checkbox state for violations
    const violations = [
        "1. Nhân viên sử dụng điện thoại riêng trong giờ làm?",
        "2. Nhân viên gợi ý hoặc xin tiền thưởng (tip)?",
        "3. Nhân viên nói chuyện riêng quá nhiều?",
        "4. Nhân viên thực hiện sai quy trình?",
        "5. Nhân viên không sắp xếp và bảo quản đồ của khách?",
        "6. Nhân viên có thông báo bấm giờ khi bắt đầu dịch vụ không?"
    ];

    const [selectedViolations, setSelectedViolations] = useState<number[]>([]);

    // Restore from localStorage on mount (from ActiveService)
    React.useEffect(() => {
        try {
            const saved = localStorage.getItem('spa_wrb_violations');
            if (saved) {
                const parsedViolations = JSON.parse(saved);
                setSelectedViolations(parsedViolations);

                // Pre-calculate rating constraints based on restored violations
                const count = parsedViolations.length;
                if (count >= 3) setRating(1);
                else if (count >= 2) setRating(2);
                else if (count >= 1) setRating(3);
            }
        } catch (e) { }
    }, []);

    const toggleViolation = (index: number) => {
        setSelectedViolations(prevViolations => {
            const newViolations = prevViolations.includes(index)
                ? prevViolations.filter(i => i !== index)
                : [...prevViolations, index];

            const count = newViolations.length;
            setRating(prevRating => {
                if (count >= 3 && prevRating !== null && prevRating > 1) return 1;
                if (count >= 2 && prevRating !== null && prevRating > 2) return 2;
                if (count >= 1 && prevRating === 4) return 3;
                return prevRating;
            });

            // Sync any new changes to localStorage just in case of reload
            try {
                localStorage.setItem('spa_wrb_violations', JSON.stringify(newViolations));
            } catch (e) { }

            return newViolations;
        });
    };

    const clearStorageAndComplete = (data: { rating: number, violations: number[], tipAmount: number }) => {
        try {
            localStorage.removeItem('spa_wrb_violations');
        } catch (e) { }
        onComplete(data);
    };

    const handleSubmit = () => {
        if (rating === 4) { // 4 is 'Xuất sắc'
            setShowTip(true);
        } else {
            clearStorageAndComplete({ rating: rating!, violations: selectedViolations, tipAmount: 0 });
        }
    };

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20">
            {/* Header / Top Card */}
            <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-100 flex-shrink-0 z-10">
                    <img 
                        src={staffAvatar || "https://i.pravatar.cc/150?img=32"} 
                        alt="Therapist" 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <div className="flex-1 z-10">
                    <h2 className="text-xl font-black text-gray-800">{staffName || "Đang cập nhật..."}</h2>
                    <p className="text-gray-500 font-medium text-sm">
                        {serviceName || "Dịch vụ"} {duration ? `• ${duration} min` : ""}
                    </p>
                    <div className="flex text-amber-500 text-sm mt-1">
                        ★ ★ ★ ★ ★ <span className="text-gray-400 text-xs ml-1">(5.0)</span>
                    </div>
                </div>
            </div>

            {/* Assessment Box */}
            <div className="w-full bg-gradient-to-br from-amber-200 to-amber-300 rounded-3xl p-6 shadow-md mb-8">
                <p className="text-amber-950 font-semibold text-sm leading-relaxed mb-4 text-justify">
                    Xin quý khách vui lòng đánh giá chất lượng dịch vụ để chúng tôi có cơ hội thấu hiểu và hoàn thiện trải nghiệm của bạn tốt hơn mỗi ngày.
                    Sự hài lòng của bạn chính là phần thưởng quý giá nhất mà đội ngũ chúng tôi luôn trân trọng và biết ơn.
                </p>
            </div>

            {/* Violations Checklist */}
            <div className={`w-full mb-10 transition-all duration-300 ${isViolationsOpen ? 'bg-gray-50/50 rounded-[32px] p-2 -mx-2' : ''}`}>
                <div 
                    onClick={() => setIsViolationsOpen(!isViolationsOpen)}
                    className="flex items-center justify-between mb-2 p-4 bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${selectedViolations.length > 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-gray-800 font-bold text-sm">Các lỗi dịch vụ (nếu có)</h3>
                            {selectedViolations.length > 0 && (
                                <p className="text-[10px] text-amber-600 font-bold tracking-wide uppercase">Đã chọn {selectedViolations.length} lỗi</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {selectedViolations.length === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">Bỏ qua</span>
                        )}
                        <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isViolationsOpen ? 'rotate-180' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                <div className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${isViolationsOpen ? 'max-h-[1000px] opacity-100 mt-4 px-2 pb-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                    {violations.map((v, idx) => (
                        <div key={idx}
                            onClick={() => toggleViolation(idx)}
                            className={`flex items-start gap-4 p-4 bg-white rounded-2xl cursor-pointer transition-all border ${selectedViolations.includes(idx) ? 'border-amber-200 shadow-sm ring-1 ring-amber-100' : 'border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]'}`}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedViolations.includes(idx) ? 'border-amber-500 bg-amber-500' : 'border-gray-300 bg-white'}`}>
                                {selectedViolations.includes(idx) && (
                                    <svg className="w-3.2 h-3.2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                )}
                            </div>
                            <span className={`text-[13px] leading-snug font-medium ${selectedViolations.includes(idx) ? 'text-amber-900' : 'text-gray-500'}`}>{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ratings */}
            <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Trải nghiệm của bạn thế nào?</h3>

            <div className="grid grid-cols-2 gap-4 w-full mb-10">
                <button
                    onClick={() => setRating(1)}
                    className={`p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${rating === 1 ? 'bg-red-50 border-2 border-red-200 scale-105' : 'bg-gray-50 border-2 border-transparent opacity-70 hover:opacity-100'}`}
                >
                    <span className="text-4xl">😡</span>
                    <span className="font-bold text-red-500 text-sm">Tệ</span>
                </button>
                <button
                    disabled={selectedViolations.length >= 3}
                    onClick={() => setRating(2)}
                    className={`p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${selectedViolations.length >= 3 ? 'bg-gray-100 border-2 border-transparent opacity-40 grayscale cursor-not-allowed' : rating === 2 ? 'bg-orange-50 border-2 border-orange-200 scale-105' : 'bg-gray-50 border-2 border-transparent opacity-70 hover:opacity-100'}`}
                >
                    <span className="text-4xl">😐</span>
                    <span className="font-bold text-orange-500 text-sm">Bình thường</span>
                </button>
                <button
                    disabled={selectedViolations.length >= 2}
                    onClick={() => setRating(3)}
                    className={`p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${selectedViolations.length >= 2 ? 'bg-gray-100 border-2 border-transparent opacity-40 grayscale cursor-not-allowed' : rating === 3 ? 'bg-amber-50 border-2 border-amber-200 scale-105' : 'bg-gray-50 border-2 border-transparent opacity-70 hover:opacity-100'}`}
                >
                    <span className="text-4xl">🙂</span>
                    <span className="font-bold text-amber-500 text-sm">Tốt</span>
                </button>
                <button
                    disabled={selectedViolations.length >= 1}
                    onClick={() => setRating(4)}
                    className={`relative p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${selectedViolations.length >= 1 ? 'bg-gray-100 border-2 border-transparent opacity-40 grayscale cursor-not-allowed' : rating === 4 ? 'bg-amber-100 border-2 border-amber-300 shadow-md scale-105' : 'bg-gray-50 border-2 border-transparent opacity-70 hover:opacity-100'}`}
                >
                    <div className="absolute -top-3 -right-2 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-sm transform rotate-12">Top</div>
                    <span className="text-4xl">🤩</span>
                    <span className="font-bold text-amber-600 text-sm">Xuất sắc</span>
                </button>
            </div>

            {/* Sticky Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="max-w-md mx-auto">
                    <button
                        disabled={rating === null}
                        onClick={handleSubmit}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${rating !== null ? 'bg-gray-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-black' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                        {rating !== null ? 'Gửi đánh giá' : 'Chọn mức độ hài lòng để Gửi'}
                    </button>
                </div>
            </div>

            {/* Tip Modal Overlay */}
            {showTip && <TipModal onClose={(tip) => {
                setShowTip(false);
                clearStorageAndComplete({ rating: rating!, violations: selectedViolations, tipAmount: tip });
            }} />}
        </div>
    );
}
