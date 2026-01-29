/*
 * Component: MenuHeader
 * Chức năng: Header của trang menu với logo và thông tin dịch vụ
 */

"use client";

import React from 'react';

interface MenuHeaderProps {
  lang: string;
  service: string;
}

export default function MenuHeader({ lang, service }: MenuHeaderProps) {
  const serviceLabels: Record<string, Record<string, string>> = {
    "new-user": {
      vi: "Khách hàng mới",
      en: "New Customer",
      jp: "新規顧客",
      kr: "신규 고객",
      cn: "新客户"
    },
    "old-user": {
      vi: "Khách hàng cũ",
      en: "Returning Customer",
      jp: "リピート顧客",
      kr: "기존 고객",
      cn: "老客户"
    },
    "vip": {
      vi: "Khách hàng VIP",
      en: "VIP Customer",
      jp: "VIP顧客",
      kr: "VIP 고객",
      cn: "VIP客户"
    }
  };

  const currentServiceLabel = serviceLabels[service]?.[lang as keyof typeof serviceLabels[typeof service]] || serviceLabels["old-user"][lang as keyof typeof serviceLabels.old];

  return (
    <header className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="relative container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">
                  {lang === 'vi' ? 'Spa Nơi Bộ' : 'Noi Bo Spa'}
                </h1>
                <p className="text-sm text-white/80">{currentServiceLabel}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
              {lang === 'vi' ? 'Trang chủ' : 'Home'}
            </button>
            <button className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
              {lang === 'vi' ? 'Lịch hẹn' : 'Appointments'}
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/30 transition-all duration-200 font-medium">
              {lang === 'vi' ? 'Đặt lịch ngay' : 'Book Now'}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>
  );
}