/* File: src/app/[lang]/customer-type/CustomerType.animation.ts */

// Class cho Container chính của popup (Lớp phủ mờ)
export const getPopupOverlayClass = (isOpen: boolean) => {
    return `
    fixed inset-0 z-50 flex items-center justify-center p-4 
    bg-black/80 backdrop-blur-sm 
    transition-opacity duration-300 ease-in-out
    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
  `;
};

// Class cho nội dung bên trong Popup (Hiệu ứng scale)
export const getPopupContentClass = (isOpen: boolean) => {
    return `
    bg-[#1a1a1a] border border-yellow-500/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative
    transform transition-all duration-300 ease-out
    ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
  `;
};