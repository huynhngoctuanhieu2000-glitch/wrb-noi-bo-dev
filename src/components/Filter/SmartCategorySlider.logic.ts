'use client';

import { create } from 'zustand';
import { SpaCategoryCode } from '@/constants/SpaCategories';

interface FilterState {
    categoryId: SpaCategoryCode;
    setCategoryId: (id: SpaCategoryCode) => void;
}

export const useServiceFilter = create<FilterState>((set) => ({
    categoryId: 'ALL',
    setCategoryId: (id) => set({ categoryId: id }),
}));
