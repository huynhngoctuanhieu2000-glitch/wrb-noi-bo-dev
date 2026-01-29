/*
 * File: CustomerType.i18n.ts
 * Chức năng: Định nghĩa các text đa ngôn ngữ cho trang chọn loại khách hàng
 * Chứa bản dịch cho 5 ngôn ngữ: en, vn, jp, kr, cn
 * Cung cấp type TranslationKey để type safety
 */

/**
 * Type định nghĩa các key có thể dịch
 */
export type TranslationKey = 'wc_title' | 'wc_desc' | 'btn_new_title' | 'btn_new_desc' | 'btn_old_title' | 'btn_back';

/**
 * Object chứa tất cả bản dịch theo ngôn ngữ
 * Mỗi ngôn ngữ có record với các key tương ứng
 */
export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    wc_title: 'Welcome',
    wc_desc: 'Are you a new or returning customer?',
    btn_new_title: 'New Customer',
    btn_new_desc: 'First time visitor',
    btn_old_title: 'Returning Customer',
    btn_back: 'Back'
  },
  vn: {
    wc_title: 'Chào mừng',
    wc_desc: 'Bạn là khách hàng mới hay đã từng đến?',
    btn_new_title: 'Khách hàng mới',
    btn_new_desc: 'Lần đầu đến',
    btn_old_title: 'Khách hàng cũ',
    btn_back: 'Quay lại'
  },
  jp: {
    wc_title: 'ようこそ',
    wc_desc: '新規のお客様ですか？',
    btn_new_title: '新規',
    btn_new_desc: '初めてのお客様',
    btn_old_title: 'リピート',
    btn_back: '戻る'
  },
  kr: {
    wc_title: '환영합니다',
    wc_desc: '처음 방문하십니까?',
    btn_new_title: '신규 고객',
    btn_new_desc: '첫 방문',
    btn_old_title: '기존 고객',
    btn_back: '돌아가기'
  },
  cn: {
    wc_title: '欢迎',
    wc_desc: '您是新客户还是回头客？',
    btn_new_title: '新客户',
    btn_new_desc: '首次光临',
    btn_old_title: '回头客',
    btn_back: '返回'
  }
};