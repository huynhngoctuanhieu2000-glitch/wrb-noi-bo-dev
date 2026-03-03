import { useState } from 'react';
import { useAuthStore } from '@/lib/authStore.logic';
import { useServiceCountdown } from './useServiceCountdown.logic';

export const useStaffSwitcherLogic = (
    startTimeISO: string | null,
    durationMinutes: number,
    menuType: 'STANDARD' | 'VIP' = 'STANDARD'
) => {
    const { isAuthUser } = useAuthStore();
    const { elapsedMinutes, isFinished } = useServiceCountdown(startTimeISO, durationMinutes);

    const [isLoading, setIsLoading] = useState(false);
    const [isRequested, setIsRequested] = useState(false);

    // Điều kiện: (Is_Auth_User == true) && (Elapsed_Time < 15) && (Menu_Type == 'STANDARD')
    const isVisible =
        isAuthUser &&
        elapsedMinutes < 15 &&
        !isFinished;
    // Ghi chú: Có thể thêm điều kiện menuType === 'STANDARD' nếu bắt buộc. 
    // Theo logic yêu cầu: Khách hàng auth và 15p đầu đều có quyền đổi, VIP mặc định là xịn.

    const handleRequestSwitch = async () => {
        if (!isVisible || isRequested) return;

        setIsLoading(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsRequested(true);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đổi nhân viên', error);
            alert('Đã xảy ra lỗi, vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isVisible,
        isLoading,
        isRequested,
        handleRequestSwitch
    };
};
