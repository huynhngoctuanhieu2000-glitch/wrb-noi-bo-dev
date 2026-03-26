'use client';

import ComingSoon from '@/components/ComingSoon/ComingSoon';
import { useParams } from 'next/navigation';

export default function HomeSpaBookPage() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';

    return (
        <ComingSoon
            title={lang === 'vi' ? 'Sách HomeSpa' : 'HomeSpa Book'}
            subtitle={lang === 'vi'
                ? 'Hướng dẫn chăm sóc sức khỏe và sắc đẹp tại nhà'
                : 'Your guide to health and beauty care at home'
            }
            lang={lang}
        />
    );
}
