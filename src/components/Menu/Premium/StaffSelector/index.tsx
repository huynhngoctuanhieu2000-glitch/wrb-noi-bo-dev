import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStaff, type MockStaff } from '../mockData';

// =============================================
// 🧑 Staff Selector – CELESTIAL Gallery Design
// Mockup Screen 2: Danh sách Chuyên Gia
// =============================================

interface StaffSelectorProps {
  lang: string;
  preferredCategoryId?: string;
  onConfirmSelection: (selectedStaffIds: string[]) => void;
}

const StaffSelector = ({ lang, preferredCategoryId, onConfirmSelection }: StaffSelectorProps) => {
  const isVi = lang === 'vi';
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sort: Working today first, then by skill match, then by rating
  const sortedStaff = useMemo(() => {
    return [...mockStaff].sort((a, b) => {
      if (!a.isWorkingToday && b.isWorkingToday) return 1;
      if (a.isWorkingToday && !b.isWorkingToday) return -1;
      if (preferredCategoryId) {
        const aMatch = (a.skills as any)[preferredCategoryId] ? 1 : 0;
        const bMatch = (b.skills as any)[preferredCategoryId] ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }
      return b.rating - a.rating;
    });
  }, [preferredCategoryId]);

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (staff: MockStaff) => {
    if (!staff.isWorkingToday) {
      return (
        <div className="absolute top-5 left-5 bg-[#93000a]/20 backdrop-blur-md border border-[#ffb4ab]/20 px-3.5 py-1.5 rounded-full z-20">
          <span className="text-[10px] tracking-[0.1em] text-[#ffb4ab] font-bold uppercase">
            {isVi ? 'NGHỈ HÔM NAY' : 'OFF TODAY'}
          </span>
        </div>
      );
    }
    if (staff.availableAfter) {
      return (
        <div className="absolute top-5 left-5 bg-amber-500/15 backdrop-blur-md border border-amber-400/20 px-3.5 py-1.5 rounded-full z-20">
          <span className="text-[10px] tracking-[0.1em] text-amber-300 font-bold uppercase">
            {isVi ? `RẢNH SAU ${staff.availableAfter}` : `FREE AFTER ${staff.availableAfter}`}
          </span>
        </div>
      );
    }
    return (
      <div className="absolute top-5 left-5 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3.5 py-1.5 rounded-full z-20">
        <span className="text-[10px] tracking-[0.1em] text-emerald-400 font-bold uppercase">
          {isVi ? 'SẴN SÀNG' : 'AVAILABLE'}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col px-6 pt-2 pb-8"
    >
      {/* Section Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-serif italic text-[#e6c487] leading-tight mb-2">
          {isVi ? 'DANH SÁCH CHUYÊN GIA' : 'OUR EXPERTS'}
        </h2>
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#d0c5b5]/80">
          {isVi ? 'Những đôi tay tài hoa sẵn sàng chăm sóc bạn' : 'Talented hands ready to care for you'}
        </p>
      </motion.section>

      {/* Therapist Gallery */}
      <div className="space-y-8">
        {sortedStaff.map((staff, idx) => {
          const isSelected = selectedIds.includes(staff.id);
          const isRecommended = preferredCategoryId && (staff.skills as any)[preferredCategoryId];

          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              onClick={() => handleToggle(staff.id)}
              className={`group relative rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-all duration-300
                ${isSelected ? 'ring-2 ring-[#e6c487] ring-offset-2 ring-offset-[#131315]' : ''}
                ${!staff.isWorkingToday ? 'opacity-60' : ''}
              `}
            >
              {/* Image Container */}
              <div className="relative h-[380px] w-full overflow-hidden bg-[#1b1b1d]">
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Status Badge */}
                {getStatusBadge(staff)}

                {/* Rating Badge */}
                <div className="absolute top-5 right-5 bg-[#131315]/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20">
                  <svg className="w-3.5 h-3.5 text-[#e6c487]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-xs font-bold text-[#e4e2e4]">{staff.rating}</span>
                </div>

                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute top-16 left-5 bg-[#e6c487]/15 backdrop-blur-md border border-[#e6c487]/30 px-3 py-1 rounded-full z-20">
                    <span className="text-[9px] tracking-[0.1em] text-[#e6c487] font-bold uppercase">
                      {isVi ? '⭐ ĐỀ XUẤT' : '⭐ RECOMMENDED'}
                    </span>
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-5 right-16 bg-[#e6c487] w-7 h-7 rounded-full flex items-center justify-center z-20 shadow-lg">
                    <svg className="w-4 h-4 text-[#412d00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-7 bg-gradient-to-t from-[#131315] via-[#131315]/60 to-transparent">
                  <h3 className="font-serif italic text-2xl text-[#e4e2e4] mb-1">{staff.name}</h3>
                  <p className="text-[11px] tracking-[0.12em] text-[#e6c487] uppercase mb-5">
                    {isVi ? staff.title.vi : staff.title.en}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <div className={`flex-1 py-3.5 rounded-full text-center text-xs font-bold tracking-[0.1em] uppercase transition-all ${
                      staff.isWorkingToday
                        ? 'bg-[#e6c487] text-[#412d00]'
                        : 'border border-[#4d463a] text-[#e4e2e4]'
                    }`}>
                      {staff.isWorkingToday
                        ? (isVi ? 'ĐẶT NGAY' : 'BOOK NOW')
                        : (isVi ? 'XEM LỊCH RẢNH' : 'VIEW SCHEDULE')
                      }
                    </div>
                    <div className="w-[52px] h-[52px] rounded-full border border-[#4d463a]/30 flex items-center justify-center text-[#e6c487] group-hover:border-[#e6c487]/50 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating CTA Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-6 right-6 z-40"
          >
            <button
              onClick={() => onConfirmSelection(selectedIds)}
              className="w-full py-5 rounded-full bg-[#e6c487] text-[#412d00] font-bold tracking-[0.12em] text-sm shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 active:scale-95 duration-200 uppercase"
            >
              <span>{isVi ? `Tiếp tục với ${selectedIds.length} chuyên viên` : `Continue with ${selectedIds.length} therapists`}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Quote */}
      <div className="mt-16 text-center px-4 opacity-40">
        <p className="font-serif italic text-base text-[#c9a96e] leading-relaxed">
          {isVi
            ? '"Nghệ thuật của sự thư giãn bắt đầu từ những tâm hồn tinh tế nhất."'
            : '"The art of relaxation begins with the most refined souls."'
          }
        </p>
      </div>
    </motion.div>
  );
};

export default StaffSelector;
