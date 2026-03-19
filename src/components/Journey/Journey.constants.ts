/**
 * Journey Constants — Shared UI configs, data definitions, and constants.
 * Centralizes duplicated data (violations, timer config, rating options)
 * that was previously scattered across ActiveService, ServiceList, Feedback.
 */

// ─── Timer UI Configuration ──────────────────────────────────────────────────

export const TIMER_CONFIG = {
    CIRCULAR_SIZE: 300,
    INNER_SIZE: 200,
    RADIUS: 120,
    ANIMATION_DURATION: 500,
    MIN_HEIGHT: '80vh',
    AMBER_DARK: 'text-amber-900',
    AMBER_MAIN: '#F59E0B',
    AMBER_LIGHT: '#FFFBEB',
    TAB_HEIGHT: 56,
};

/** Compact timer config for ServiceList view */
export const TIMER_CONFIG_COMPACT = {
    TIMER_SIZE: 260,
    INNER_SIZE: 180,
    RADIUS: 110,
    AMBER_MAIN: '#F59E0B',
    AMBER_LIGHT: '#FFFBEB',
};

// ─── Violations Checklist ────────────────────────────────────────────────────

export const VIOLATIONS_VI = [
    '1. Nhân viên sử dụng điện thoại riêng trong giờ làm?',
    '2. Nhân viên gợi ý hoặc xin tiền thưởng (tip)?',
    '3. Nhân viên nói chuyện riêng quá nhiều?',
    '4. Nhân viên thực hiện sai quy trình?',
    '5. Nhân viên không sắp xếp và bảo quản đồ của khách?',
    '6. Nhân viên có thông báo bấm giờ khi bắt đầu dịch vụ không?',
];

export const VIOLATIONS_EN = [
    '1. Therapist using personal phone during service?',
    '2. Therapist hinting or asking for a tip?',
    '3. Therapist talking too much?',
    '4. Therapist not following the correct procedure?',
    '5. Therapist not safeguarding your belongings?',
    '6. Did the therapist notify when starting the timer?',
];

/** Get violations list by language */
export const getViolations = (lang: string) =>
    lang === 'vi' ? VIOLATIONS_VI : VIOLATIONS_EN;

// ─── Rating Options ──────────────────────────────────────────────────────────

export const RATING_OPTIONS = [
    {
        value: 1,
        emoji: '😡',
        label: 'Tệ',
        labelEN: 'Bad',
        bg: 'bg-red-100 border-red-400',
        bgSel: 'bg-red-200 border-red-500 scale-105 shadow-md',
    },
    {
        value: 2,
        emoji: '😐',
        label: 'OK',
        labelEN: 'Ok',
        bg: 'bg-gray-50 border-gray-200',
        bgSel: 'bg-gray-200 border-gray-500 scale-105 shadow-md',
    },
    {
        value: 3,
        emoji: '🙂',
        label: 'Tốt',
        labelEN: 'Good',
        bg: 'bg-amber-50 border-amber-200',
        bgSel: 'bg-amber-200 border-amber-500 scale-105 shadow-md',
    },
    {
        value: 4,
        emoji: '🤩',
        label: 'Xuất sắc',
        labelEN: 'Excellent',
        bg: 'bg-amber-100 border-amber-300',
        bgSel: 'bg-amber-300 border-amber-600 scale-105 shadow-md',
    },
];

// ─── Change Staff Threshold ──────────────────────────────────────────────────

/** Minutes after which "Change Staff" is disabled */
export const CHANGE_STAFF_TIMEOUT_MINUTES = 15;
