/*
 * File: Menu/constants.ts
 * Chức năng: Chứa dữ liệu tĩnh (Static Data) và cấu hình mặc định.
 * Logic chi tiết:
 * - CATEGORIES: Danh sách các danh mục dịch vụ (Body, Foot, Facial, Package...).
 * - SERVICES: Dữ liệu mẫu (Dummy Data) dùng để hiển thị thử nghiệm hoặc fallback.
 * Tác giả: TunHisu
 * Ngày cập nhật: 2026-01-31
 */
import { Category, Service } from './types';

export const CATEGORIES: Category[] = [
    {
        id: 'Body',
        names: {
            en: 'Body Massage',
            vn: 'Massage Body',
            jp: 'ボディマッサージ',
            kr: '전신 마사지',
            cn: '全身按摩'
        },
        image: 'https://i.ibb.co/3yZbCj1Z/icon-body-150x150px.webp'
    },
    {
        id: 'Foot',
        names: {
            en: 'Foot Massage',
            vn: 'Massage Chân',
            jp: '足裏マッサージ',
            kr: '발 마사지',
            cn: '足部按摩'
        },
        image: 'https://i.ibb.co/bRKN60Tv/icon-foot-150x150-px.webp'
    },
    {
        id: 'Hair Wash',
        names: {
            en: 'Hair Wash',
            vn: 'Gội Đầu',
            jp: '洗髪',
            kr: '샴푸',
            cn: '洗头'
        },
        image: 'https://i.ibb.co/d47f0CxD/icon-hairwash-150x150px.webp'
    },
    {
        id: 'Facial',
        names: {
            en: 'Facial',
            vn: 'Chăm Sóc Mặt',
            jp: 'フェイシャル',
            kr: '페이셜 케어',
            cn: '面部护理'
        },
        image: 'https://i.ibb.co/xxjHXk7/icon-facial-150x150px.webp'
    },
    {
        id: 'Heel Skin Shave',
        names: {
            en: 'Heel Care',
            vn: 'Chà Gót Chân',
            jp: 'かかとケア',
            kr: '발뒤꿈치 케어',
            cn: '磨脚皮'
        },
        image: 'https://i.ibb.co/W4sc6ngT/icon-heelskinshave-150x150px.webp'
    },
    {
        id: 'Manicure & Pedicure',
        names: {
            en: 'Nails',
            vn: 'Làm Móng',
            jp: 'ネイル',
            kr: '네일 케어',
            cn: '美甲'
        },
        image: 'https://i.ibb.co/dwnwS8Jz/icon-nails-150x150px.webp'
    },
    {
        id: 'Ear Clean',
        names: {
            en: 'Ear Clean',
            vn: 'Ráy Tai',
            jp: '耳掃除',
            kr: '귀 청소',
            cn: '采耳'
        },
        image: 'https://i.ibb.co/fVpNcJFG/icon-earclean-150x150px.webp'
    },
    {
        id: 'Barber',
        names: {
            en: 'Barber',
            vn: 'Cắt Tóc Nam',
            jp: '理容',
            kr: '이발',
            cn: '男士理发'
        },
        image: 'https://i.ibb.co/Q3GPkbtr/icon-haircut-150x150px.webp'
    },
    {
        id: 'Premium',
        names: {
            en: 'VIP Package',
            vn: 'Gói VIP',
            jp: 'VIPコース',
            kr: 'VIP 코스',
            cn: 'VIP套餐'
        },
        image: 'https://i.ibb.co/9kDZJ072/icon-cbking-150-x-150-px.webp'
    },
    {
        id: 'Additional',
        names: {
            en: 'Add-on',
            vn: 'Dịch Vụ Lẻ',
            jp: '追加サービス',
            kr: '추가 서비스',
            cn: '额外服务'
        },
        image: 'https://i.ibb.co/ynvbRJBM/addd.png'
    }
];