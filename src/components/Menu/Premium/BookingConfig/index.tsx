import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStaff, mockSkills, mockTimeSlots, VIP_PRICE_PER_60_MIN } from '../mockData';

// =============================================
// 📅 Booking Config – CELESTIAL Design
// Mockup Screen 3: KTV profile + Date + Skills + Time
// All-in-one booking configuration screen
// =============================================

interface BookingConfigProps {
  lang: string;
  selectedStaffIds: string[];
  onConfirm: (data: { skills: string[]; totalDuration: number; timeSlot: string | null }) => void;
}

const BookingConfig = ({ lang, selectedStaffIds, onConfirm }: BookingConfigProps) => {
  const isVi = lang === 'vi';
  const staffList = mockStaff.filter(s => selectedStaffIds.includes(s.id));
  const primaryStaff = staffList[0];

  // State
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0); // index in day chips

  // Mock Day Chips (next 5 days)
  const dayChips = useMemo(() => {
    const days = [];
    const dayNames = isVi
      ? ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        label: dayNames[d.getDay()],
        date: d.getDate(),
      });
    }
    return days;
  }, [isVi]);

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Calculate total duration & price
  const totalDuration = useMemo(() => {
    return selectedSkills.reduce((sum, skId) => {
      const sk = mockSkills.find(s => s.id === skId);
      return sum + (sk?.duration || 0);
    }, 0);
  }, [selectedSkills]);

  const totalPrice = (totalDuration / 60) * VIP_PRICE_PER_60_MIN;
  const isReady = selectedSkills.length > 0 && (selectedSlot !== null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col px-6 pt-2 pb-36"
    >
      {/* Selected Therapist Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-28 rounded-[1.5rem] overflow-hidden shadow-2xl">
              <img src={primaryStaff?.avatar} alt={primaryStaff?.name} className="w-full h-full object-cover" />
            </div>
            {/* Verified badge */}
            <div className="absolute -bottom-1.5 -right-1.5 bg-[#e6c487] p-1 rounded-full shadow-lg">
              <svg className="w-3.5 h-3.5 text-[#412d00]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#ffb597]">
              Expert Therapist
            </span>
            <h2 className="text-2xl font-serif italic text-[#e6c487] mt-0.5">{primaryStaff?.name}</h2>
            <div className="flex items-center gap-1 text-[#e6c487]/60 mt-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-xs">{primaryStaff?.rating} ({primaryStaff?.reviewCount} reviews)</span>
            </div>
            {/* Show other selected staff */}
            {staffList.length > 1 && (
              <div className="flex items-center gap-1 mt-2">
                {staffList.slice(1).map(s => (
                  <img key={s.id} src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full border border-[#e6c487]/40" />
                ))}
                <span className="text-[10px] text-[#d0c5b5] ml-1">
                  +{staffList.length - 1} {isVi ? 'chuyên viên khác' : 'more'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Section: Chọn Ngày */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#d0c5b5] flex items-center mb-4">
          <span className="w-8 h-px bg-[#4d463a] mr-3" />
          {isVi ? 'CHỌN NGÀY' : 'SELECT DATE'}
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {dayChips.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`flex flex-col items-center justify-center min-w-[60px] h-20 rounded-full transition-all duration-200 ${
                selectedDay === idx
                  ? 'bg-[#c9a96e]/20 border border-[#e6c487]/30 text-[#e6c487]'
                  : 'bg-[#1b1b1d] text-[#d0c5b5] border border-transparent'
              }`}
            >
              <span className="text-[10px] uppercase tracking-tighter opacity-70">{day.label}</span>
              <span className="text-xl font-bold mt-0.5">{day.date}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Section: Kỹ Năng Chuyên Biệt */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#d0c5b5] flex items-center mb-4">
          <span className="w-8 h-px bg-[#4d463a] mr-3" />
          {isVi ? 'KỸ NĂNG CHUYÊN BIỆT' : 'SPECIALTIES'}
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {mockSkills.map(skill => {
            const isActive = selectedSkills.includes(skill.id);
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={`px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c9a96e] text-[#543d0c] shadow-lg shadow-[#e6c487]/10 font-bold'
                    : 'bg-[#2a2a2c] border border-[#4d463a]/30 text-[#d0c5b5] hover:border-[#998f81]/50'
                }`}
              >
                <span className="text-xs">{isVi ? skill.name.vi : skill.name.en}</span>
                <span className={`text-[10px] ${isActive ? 'text-[#412d00]/70' : 'text-[#998f81]'}`}>
                  {skill.duration}p
                </span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Section: Thời Gian Trống */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#d0c5b5] flex items-center mb-5">
          <span className="w-8 h-px bg-[#4d463a] mr-3" />
          {isVi ? 'THỜI GIAN TRỐNG' : 'AVAILABLE TIMES'}
        </h3>

        <div className="space-y-5">
          {/* Morning */}
          <div>
            <div className="flex items-center text-[#ffb597] gap-2 mb-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-[10px] tracking-[0.15em] uppercase">{isVi ? 'Buổi Sáng' : 'Morning'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {mockTimeSlots.morning.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`py-3 text-center rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-[#1b1b1d]/50 text-[#998f81]/30 border border-transparent cursor-not-allowed line-through'
                      : selectedSlot === slot.time
                        ? 'bg-[#e6c487]/10 border border-[#e6c487] text-[#e6c487] font-bold shadow-[0_0_15px_rgba(230,196,135,0.1)]'
                        : 'bg-[#1b1b1d] border border-[#4d463a]/20 text-[#e4e2e4]/60 hover:border-[#998f81]/40'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {/* Afternoon */}
          <div>
            <div className="flex items-center text-[#ffb597] gap-2 mb-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-[10px] tracking-[0.15em] uppercase">{isVi ? 'Buổi Chiều' : 'Afternoon'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {mockTimeSlots.afternoon.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`py-3 text-center rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-[#1b1b1d]/50 text-[#998f81]/30 border border-transparent cursor-not-allowed line-through'
                      : selectedSlot === slot.time
                        ? 'bg-[#e6c487]/10 border border-[#e6c487] text-[#e6c487] font-bold shadow-[0_0_15px_rgba(230,196,135,0.1)]'
                        : 'bg-[#1b1b1d] border border-[#4d463a]/20 text-[#e4e2e4]/60 hover:border-[#998f81]/40'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {/* Evening */}
          <div>
            <div className="flex items-center text-[#ffb597] gap-2 mb-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              <span className="text-[10px] tracking-[0.15em] uppercase">{isVi ? 'Buổi Tối' : 'Evening'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {mockTimeSlots.evening.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`py-3 text-center rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-[#1b1b1d]/50 text-[#998f81]/30 border border-transparent cursor-not-allowed line-through'
                      : selectedSlot === slot.time
                        ? 'bg-[#e6c487]/10 border border-[#e6c487] text-[#e6c487] font-bold shadow-[0_0_15px_rgba(230,196,135,0.1)]'
                        : 'bg-[#1b1b1d] border border-[#4d463a]/20 text-[#e4e2e4]/60 hover:border-[#998f81]/40'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#4d463a]/40" /></div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-[#131315] text-[10px] text-[#998f81] uppercase tracking-[0.2em]">
              {isVi ? 'Hoặc' : 'Or'}
            </span>
          </div>
        </div>

        {/* Branch Decide Option */}
        <button
          onClick={() => setSelectedSlot('BRANCH_DECIDE')}
          className={`w-full py-4 px-6 rounded-xl font-medium transition-all border ${
            selectedSlot === 'BRANCH_DECIDE'
              ? 'bg-[#e6c487]/10 border-[#e6c487] text-[#e6c487]'
              : 'bg-[#1b1b1d] border-[#4d463a]/30 text-[#d0c5b5] hover:border-[#998f81]/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-sm">{isVi ? 'Đến lấy vé tại Chi Nhánh' : 'Walk-in at Branch'}</span>
          </div>
          <p className="text-[10px] text-[#998f81] mt-1 font-normal">
            {isVi ? 'Chúng tôi sẽ thông báo để KTV sẵn sàng đón bạn' : 'We will notify therapists to prepare'}
          </p>
        </button>
      </motion.section>

      {/* Floating CTA Bar */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-6 right-6 z-40"
          >
            {/* Summary Bar */}
            {totalDuration > 0 && (
              <div className="flex justify-between items-end mb-3 px-2">
                <div>
                  <div className="text-[10px] text-[#998f81] uppercase tracking-wider">{isVi ? 'Thời gian' : 'Duration'}</div>
                  <div className="text-lg font-bold text-[#e4e2e4]">{totalDuration} {isVi ? 'phút' : 'mins'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#e6c487] tracking-wider uppercase font-bold">Bespoke</div>
                  <div className="text-lg font-bold text-[#e6c487]">{totalPrice.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>
            )}
            <button
              onClick={() => onConfirm({ skills: selectedSkills, totalDuration, timeSlot: selectedSlot })}
              className="w-full py-5 rounded-full bg-[#e6c487] text-[#412d00] font-bold tracking-[0.12em] text-sm shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 active:scale-95 duration-200 uppercase"
            >
              <span>{isVi ? 'XÁC NHẬN LỰA CHỌN' : 'CONFIRM SELECTION'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookingConfig;
