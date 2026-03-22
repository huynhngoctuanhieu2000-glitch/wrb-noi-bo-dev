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

export const VIOLATIONS_KR = [
    '1. 테라피스트가 서비스 중 개인 휴대폰을 사용했나요?',
    '2. 테라피스트가 팁을 암시하거나 요청했나요?',
    '3. 테라피스트가 너무 많이 대화했나요?',
    '4. 테라피스트가 올바른 절차를 따르지 않았나요?',
    '5. 테라피스트가 고객의 소지품을 보관하지 않았나요?',
    '6. 테라피스트가 타이머 시작 시 알려주었나요?',
];

export const VIOLATIONS_JP = [
    '1. セラピストが施術中に私用の携帯電話を使用しましたか？',
    '2. セラピストがチップを暗示または要求しましたか？',
    '3. セラピストが過度に会話しましたか？',
    '4. セラピストが正しい手順に従いませんでしたか？',
    '5. セラピストがお客様の持ち物を保管しませんでしたか？',
    '6. セラピストがタイマー開始時に通知しましたか？',
];

export const VIOLATIONS_CN = [
    '1. 技师在服务期间使用个人手机？',
    '2. 技师暗示或索要小费？',
    '3. 技师聊天过多？',
    '4. 技师未按正确流程操作？',
    '5. 技师未妥善保管顾客物品？',
    '6. 技师开始计时时是否有通知？',
];

/** Map of language code to violations list */
const VIOLATIONS_MAP: Record<string, string[]> = {
    vi: VIOLATIONS_VI,
    en: VIOLATIONS_EN,
    kr: VIOLATIONS_KR,
    jp: VIOLATIONS_JP,
    cn: VIOLATIONS_CN,
};

/** Get violations list by language */
export const getViolations = (lang: string) =>
    VIOLATIONS_MAP[lang] || VIOLATIONS_EN;

// ─── Rating Options ──────────────────────────────────────────────────────────

/** Multi-language labels for rating options */
const RATING_LABELS: Record<string, Record<number, string>> = {
    vi: { 1: 'Tệ', 2: 'OK', 3: 'Tốt', 4: 'Xuất sắc' },
    en: { 1: 'Bad', 2: 'Ok', 3: 'Good', 4: 'Excellent' },
    kr: { 1: '나쁨', 2: '보통', 3: '좋음', 4: '훌륭함' },
    jp: { 1: '悪い', 2: '普通', 3: '良い', 4: '素晴らしい' },
    cn: { 1: '差', 2: '一般', 3: '好', 4: '优秀' },
};

/** Get rating label by language and value */
export const getRatingLabel = (lang: string, value: number): string =>
    RATING_LABELS[lang]?.[value] || RATING_LABELS['en'][value] || '';

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
