'use client';

import React from 'react';
import { useSyncAuthState } from '@/lib/useSyncAuthState.logic';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Kích hoạt hook đồng bộ Auth State (Zustand & Supabase) ở cấp cao nhất
    useSyncAuthState();
    return <>{children}</>;
}
