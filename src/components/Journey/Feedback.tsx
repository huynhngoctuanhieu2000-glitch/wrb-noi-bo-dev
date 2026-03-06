'use client';

import React, { useState } from 'react';
import TipModal from '@/components/Journey/TipModal';

interface FeedbackProps {
    onComplete: (result: { rating: number, violations: number[], tipAmount: number }) => void;
}

export default function Feedback({ onComplete }: FeedbackProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [showTip, setShowTip] = useState(false);

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
                    <img src="https://i.pravatar.cc/150?img=32" alt="Therapist" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 z-10">
                    <h2 className="text-xl font-black text-gray-800">Linh Nguyễn</h2>
                    <p className="text-gray-500 font-medium text-sm">Aromatherapy Massage • 90 min</p>
                    <div className="flex text-amber-500 text-sm mt-1">
                        ★ ★ ★ ★ <span className="text-gray-300">★</span> <span className="text-gray-400 text-xs ml-1">(4.8)</span>
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
            <div className="w-full mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-800 font-bold">Các lỗi dịch vụ (nếu có):</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">(Có thể bỏ qua)</span>
                </div>
                <div className="space-y-4">
                    {violations.map((v, idx) => (
                        <div key={idx}
                            onClick={() => toggleViolation(idx)}
                            className={`flex items-start gap-4 p-5 bg-white rounded-3xl cursor-pointer transition-shadow shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-md`}
                        >
                            <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedViolations.includes(idx) ? 'border-amber-500 bg-amber-500' : 'border-gray-300 bg-white'}`}>
                                {selectedViolations.includes(idx) && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                )}
                            </div>
                            <span className={`text-sm leading-snug font-medium ${selectedViolations.includes(idx) ? 'text-amber-900' : 'text-gray-500'}`}>{v}</span>
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
