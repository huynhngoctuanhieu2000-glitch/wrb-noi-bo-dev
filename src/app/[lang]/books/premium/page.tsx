'use client';

import ComingSoon from '@/components/ComingSoon/ComingSoon';
import { useParams } from 'next/navigation';

export default function PremiumBookPage() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';

    return (
        <ComingSoon
            title={lang === 'vi' ? 'Sách Premium' : 'Premium Book'}
            subtitle={lang === 'vi'
                ? 'Khám phá bộ sưu tập dịch vụ cao cấp dành riêng cho bạn'
                : 'Discover our premium service collection curated just for you'
            }
            lang={lang}
        />
    );
}
