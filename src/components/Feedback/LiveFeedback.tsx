'use client';

import React, { useState } from 'react';
import { t } from './LiveFeedback.i18n';

// 🔧 UI CONFIGURATION
const PANEL_RADIUS = '20px';
const CHECKBOX_SIZE = '24px';
const ACCENT_COLOR = '#EF4444'; // Red 500
const ACTIVE_BG_COLOR = 'rgba(239, 68, 68, 0.1)';

export const LiveFeedback = ({ lang = 'vi' }: { lang?: 'vi' | 'en' }) => {
    const localeText = t[lang];
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const questions = [
        { id: 'Q1', text: localeText.question1 },
        { id: 'Q2', text: localeText.question2 },
        { id: 'Q3', text: localeText.question3 },
        { id: 'Q4', text: localeText.question4 },
        { id: 'Q5', text: localeText.question5 },
    ];

    const handleToggle = (id: string) => {
        setSelectedIssues((prev) =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (selectedIssues.length === 0) return;
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsSubmitted(true);
        } catch (e) {
            console.error(e);
        }
    };

    if (isSubmitted) {
        return (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-xl text-center shadow-sm animate-pop">
                {localeText.successMsg}
            </div>
        );
    }

    return (
        <div
            className="w-full bg-black/90 text-white p-5 shadow-2xl backdrop-blur-md animate-fade-in-up border border-gray-800"
            style={{ borderRadius: PANEL_RADIUS }}
        >
            <h3 className="font-semibold text-lg text-emerald-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {localeText.feedbackTitle}
            </h3>

            <div className="flex flex-col gap-3">
                {questions.map((q) => {
                    const isSelected = selectedIssues.includes(q.id);
                    return (
                        <label
                            key={q.id}
                            className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${isSelected
                                    ? 'border-red-500'
                                    : 'border-gray-800 hover:border-gray-700'
                                }`}
                            style={{ backgroundColor: isSelected ? ACTIVE_BG_COLOR : 'transparent' }}
                        >
                            <div
                                className={`flex-shrink-0 flex items-center justify-center border-2 transition-colors duration-200 rounded-md`}
                                style={{
                                    width: CHECKBOX_SIZE,
                                    height: CHECKBOX_SIZE,
                                    borderColor: isSelected ? ACCENT_COLOR : '#4B5563',
                                    backgroundColor: isSelected ? ACCENT_COLOR : 'transparent'
                                }}
                            >
                                {isSelected && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pop">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                                {q.text}
                            </span>
                            {/* Ẩn checkbox native */}
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggle(q.id)}
                                className="hidden"
                            />
                        </label>
                    );
                })}
            </div>

            {selectedIssues.length > 0 && (
                <button
                    onClick={handleSubmit}
                    className="w-full mt-5 bg-red-500 text-white font-semibold py-3.5 rounded-xl hover:bg-red-600 transition-colors animate-fade-in-up active:scale-[0.98]"
                >
                    {localeText.submit}
                </button>
            )}
        </div>
    );
};
