import React from 'react';
// @ts-ignore - Ignore TS module resolution issue for literal objects
import { t } from './PostReviewScale.i18n';

export type ReviewScore = 1 | 2 | 3 | 4 | 5 | null;

export const usePostReviewLogic = (lang: 'vi' | 'en') => {
    const [score, setScore] = React.useState<ReviewScore>(null);
    const [showTipping, setShowTipping] = React.useState(false);
    const localeText = t[lang];

    const handleScoreSelect = (selectedScore: ReviewScore) => {
        setScore(selectedScore);

        // Nếu khách hàng đánh giá mức Tuyệt Vời (5) hoặc Tốt (4) thì bật Modal Tipping
        if (selectedScore === 4 || selectedScore === 5) {
            setTimeout(() => setShowTipping(true), 600);
        } else {
            setShowTipping(false);
        }
    };

    const submitReview = async () => {
        if (!score) return;
        try {
            // API Gửi đánh giá
            await new Promise(resolve => setTimeout(resolve, 500));
            alert(localeText.thanksMsg);
        } catch (e) {
            console.error(e);
        }
    };

    return {
        score,
        showTipping,
        setShowTipping,
        handleScoreSelect,
        submitReview
    };
};
