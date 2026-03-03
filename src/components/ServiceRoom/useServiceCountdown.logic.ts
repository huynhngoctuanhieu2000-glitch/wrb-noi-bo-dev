import { useState, useEffect } from 'react';

interface CountdownResult {
    timeLeft: number; // in seconds
    formattedTime: string;
    progressPercentage: number;
    isFinished: boolean;
    elapsedMinutes: number; // Can be used for "Staff Switch" conditional
}

export const useServiceCountdown = (
    startTimeISO: string | null,
    durationMinutes: number
): CountdownResult => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!startTimeISO) return;

        // Update every second
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [startTimeISO]);

    if (!startTimeISO) {
        return {
            timeLeft: durationMinutes * 60,
            formattedTime: formatTime(durationMinutes * 60),
            progressPercentage: 0,
            isFinished: false,
            elapsedMinutes: 0
        };
    }

    const startTimeMs = new Date(startTimeISO).getTime();
    const endTimeMs = startTimeMs + durationMinutes * 60 * 1000;

    const totalDurationSeconds = durationMinutes * 60;
    const elapsedSeconds = Math.max(0, Math.floor((now - startTimeMs) / 1000));
    const timeLeft = Math.max(0, Math.floor((endTimeMs - now) / 1000));

    const isFinished = timeLeft <= 0;
    const progressPercentage = Math.min(100, (elapsedSeconds / totalDurationSeconds) * 100);

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        progressPercentage,
        isFinished,
        elapsedMinutes: Math.floor(elapsedSeconds / 60)
    };
};

// Helper: Format seconds to MM:SS or HH:MM:SS
function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
