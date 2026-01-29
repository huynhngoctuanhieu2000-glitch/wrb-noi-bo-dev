/*
 * File: (intro)/layout.tsx
 * Chức năng: Layout cho nhóm trang intro (onboarding)
 * Route group này không hiện trên URL, dùng để nhóm các trang chào hỏi
 * Cung cấp cấu trúc HTML cơ bản cho các trang con
 */

export default function OnboardingLayout({ children }) {
  return (
    <div className="w-full h-full"> {/* Thay bằng div */}
      {children}
    </div>
  );
};