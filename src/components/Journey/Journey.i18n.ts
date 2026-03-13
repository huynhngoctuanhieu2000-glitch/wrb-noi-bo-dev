/* src/app/[lang]/journey/[bookingId]/Journey.i18n.ts */

export const translations: Record<string, any> = {
    vi: {
        preparing: 'Chờ phòng',
        inProgress: 'Đang làm',
        completed: 'Kiểm đồ',
        feedback: 'Đánh giá',
        title: 'Hành trình thư giãn',
        errorTitle: 'Đã xảy ra lỗi',
        retry: 'Thử lại',
        finishTitle: 'Hoàn tất!',
        finishSub: 'Cảm ơn bạn đã trải nghiệm dịch vụ.',
        goHome: 'Về trang chủ',
        redirecting: 'Đang chuyển hướng...',
        autoRedirect: 'Tự động chuyển sau vài giây',
        spa_service_fallback: 'Dịch vụ Spa',
        sos: 'KHẨN CẤP',
        sosConfirm: 'Bạn cần hỗ trợ gấp tại phòng?',
        sosSending: 'Đang báo quầy...',
        sosSent: 'Đã báo lễ tân!'
    },
    en: {
        preparing: 'Preparing',
        inProgress: 'In Service',
        completed: 'Check Belongings',
        feedback: 'Feedback',
        title: 'Relaxation Journey',
        errorTitle: 'An Error Occurred',
        retry: 'Retry',
        finishTitle: 'Completed!',
        finishSub: 'Thank you for visiting us.',
        goHome: 'Go Home',
        redirecting: 'Redirecting...',
        autoRedirect: 'Redirecting automatically in a few seconds',
        spa_service_fallback: 'Spa Service',
        sos: 'EMERGENCY',
        sosConfirm: 'Do you need urgent assistance in the room?',
        sosSending: 'Notifying...',
        sosSent: 'Reception Notified!'
    },


    kr: {
        preparing: '준비 중',
        inProgress: '서비스 중',
        completed: '소지품 확인',
        feedback: '피드백',
        title: '휴식 여정',
        errorTitle: '오류가 발생했습니다',
        retry: '다시 시도',
        finishTitle: '완료!',
        finishSub: '저희와 함께 해주셔서 감사합니다.',
        goHome: '홈으로 이동',
        redirecting: '리다이렉트 중...',
        autoRedirect: '잠시 후 자동으로 이동합니다',
        spa_service_fallback: '스파 서비스',
        sos: '비상',
        sosConfirm: '객실 내 긴급 지원이 필요하십니까?',
        sosSending: '알리는 중...',
        sosSent: '리셉션 알림 완료!'
    },
    jp: {
        preparing: '準備中',
        inProgress: '施術中',
        completed: '忘れ物確認',
        feedback: 'フィードバック',
        title: 'リラクゼーションの旅',
        errorTitle: 'エラーが発生しました',
        retry: '再試行',
        finishTitle: '完了！',
        finishSub: 'ご利用ありがとうございました。',
        goHome: 'ホームへ戻る',
        redirecting: 'リダイレクト中...',
        autoRedirect: '数秒後に自動的に移動します',
        spa_service_fallback: 'スパサービス',
        sos: '緊急',
        sosConfirm: 'お部屋での緊急なサポートが必要ですか？',
        sosSending: '通知中...',
        sosSent: '受付に通知しました！'
    },
    cn: {
        preparing: '准备中',
        inProgress: '服务中',
        completed: '检查物品',
        feedback: '评价',
        title: '放松之旅',
        errorTitle: '发生错误',
        retry: '重试',
        finishTitle: '完成！',
        finishSub: '感谢您选择我们的服务。',
        goHome: '返回首页',
        redirecting: '正在跳转...',
        autoRedirect: '几秒后自动跳转',
        spa_service_fallback: '水疗服务',
        sos: '紧急',
        sosConfirm: '您在房间内需要紧急协助吗？',
        sosSending: '正在通知...',
        sosSent: '已通知前台！'
    }

};

export type TranslationKey = keyof typeof translations.en;
