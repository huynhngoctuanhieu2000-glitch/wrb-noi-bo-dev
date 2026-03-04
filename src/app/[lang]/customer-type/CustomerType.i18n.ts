/*
 * File: CustomerType.i18n.ts
 * Chức năng: Định nghĩa các text đa ngôn ngữ cho trang chọn loại khách hàng
 * Chứa bản dịch cho 5 ngôn ngữ: en, vn, jp, kr, cn
 * Cung cấp type TranslationKey để type safety
 */

/**
 * Type định nghĩa các key có thể dịch
 */
export type TranslationKey = 'wc_title' | 'wc_desc' | 'btn_new_title' | 'btn_new_desc' | 'btn_old_title' | 'btn_back' | 'find_history' | 'desc_enter_email' | 'input_placeholder' | 'search' | 'cancel' | 'error_not_found' | 'error_desc' | 'btn_retry' | 'btn_register_new' | 'btn_logout';

/**
 * Object chứa tất cả bản dịch theo ngôn ngữ
 * Mỗi ngôn ngữ có record với các key tương ứng
 */
export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    wc_title: 'Welcome',
    wc_desc: 'What would you like to do?',
    btn_new_title: 'New Order',
    btn_new_desc: 'Create a new booking',
    btn_old_title: 'View Order History',
    btn_back: 'Back',
    find_history: 'Find History',
    desc_enter_email: 'Enter your email to retrieve past visits.',
    input_placeholder: 'example@gmail.com',
    search: 'SEARCH',
    cancel: 'Cancel',
    error_not_found: 'Not Found',
    error_desc: 'This email has not been used before.',
    btn_retry: 'Try Another Email',
    btn_register_new: 'Register New Customer',
    btn_logout: 'Switch Account / Logout'
  },
  vn: {
    wc_title: 'Chào mừng',
    wc_desc: 'Bạn muốn thực hiện điều gì?',
    btn_new_title: 'Đơn hàng mới',
    btn_new_desc: 'Tạo dịch vụ mới',
    btn_old_title: 'Xem lịch sử đơn hàng',
    btn_back: 'Quay lại',
    find_history: 'Tìm Lịch Sử',
    desc_enter_email: 'Nhập email để tìm lại lịch sử ghé thăm.',
    input_placeholder: 'example@gmail.com',
    search: 'TÌM KIẾM',
    cancel: 'Hủy',
    error_not_found: 'Không Tìm Thấy',
    error_desc: 'Email này chưa từng sử dụng dịch vụ.',
    btn_retry: 'Thử Email Khác',
    btn_register_new: 'Đăng Ký Khách Mới',
    btn_logout: 'Đổi Tài Khoản / Đăng Xuất'
  },
  jp: {
    wc_title: 'ようこそ',
    wc_desc: 'どうされますか？',
    btn_new_title: '新規注文',
    btn_new_desc: '新しい予約を作成',
    btn_old_title: '注文履歴を見る',
    btn_back: '戻る',
    find_history: '履歴検索',
    desc_enter_email: '過去の履歴を検索するにはメールを入力してください。',
    input_placeholder: 'example@gmail.com',
    search: '検索',
    cancel: 'キャンセル',
    error_not_found: '見つかりません',
    error_desc: 'このメールアドレスは登録されていません。',
    btn_retry: '別のメールを試す',
    btn_register_new: '新規登録',
    btn_logout: 'アカウント切り替え / ログアウト'
  },
  kr: {
    wc_title: '환영합니다',
    wc_desc: '무엇을 하시겠습니까?',
    btn_new_title: '새 주문',
    btn_new_desc: '새 예약 만들기',
    btn_old_title: '주문 내역 보기',
    btn_back: '돌아가기',
    find_history: '기록 찾기',
    desc_enter_email: '이전 방문 기록을 확인하려면 이메일을 입력하세요.',
    input_placeholder: 'example@gmail.com',
    search: '검색',
    cancel: '취소',
    error_not_found: '찾을 수 없음',
    error_desc: '이 이메일은 사용된 적이 없습니다.',
    btn_retry: '다른 이메일 시도',
    btn_register_new: '신규 고객 등록',
    btn_logout: '계정 전환 / 로그아웃'
  },
  cn: {
    wc_title: '欢迎',
    wc_desc: '您想做什么？',
    btn_new_title: '新订单',
    btn_new_desc: '创建新预约',
    btn_old_title: '查看订单记录',
    btn_back: '返回',
    find_history: '查找记录',
    desc_enter_email: '请输入您的电子邮件以检索过往记录。',
    input_placeholder: 'example@gmail.com',
    search: '搜索',
    cancel: '取消',
    error_not_found: '未找到',
    error_desc: '此电子邮件尚未使用过。',
    btn_retry: '尝试其他邮箱',
    btn_register_new: '注册新客户',
    btn_logout: '切换账号 / 退出'
  }
};