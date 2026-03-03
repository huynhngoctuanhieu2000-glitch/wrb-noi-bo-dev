export type SpaCategoryCode = 'BODY' | 'FOOT' | 'FACIAL' | 'EAR' | 'WASH' | 'COMBO' | 'ALL';

export interface SpaCategory {
    id: SpaCategoryCode;
    label: {
        vi: string;
        en: string;
    };
    iconPath: string; // SVG path string
}

export const SPA_CATEGORIES: SpaCategory[] = [ // Mảng icon mẫu theo user cung cấp (Body, Foot, Facial, Ear wash...)
    {
        id: 'ALL',
        label: { vi: 'Tất cả', en: 'All' },
        iconPath: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z'
    },
    {
        id: 'BODY',
        label: { vi: 'Body Massage', en: 'Body Massage' },
        iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' // Dummy human body icon
    },
    {
        id: 'FOOT',
        label: { vi: 'Foot & Nail', en: 'Foot & Nail' },
        iconPath: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V14l-4-2.5v2L12 18l9-2z' // Example shoe icon
    },
    {
        id: 'FACIAL',
        label: { vi: 'Facial Care', en: 'Facial Care' },
        iconPath: 'M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z' // Face icon
    },
    {
        id: 'EAR',
        label: { vi: 'Gội & Tai', en: 'Ear & Wash' },
        iconPath: 'M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z' // Example headphones/ear
    },
];
