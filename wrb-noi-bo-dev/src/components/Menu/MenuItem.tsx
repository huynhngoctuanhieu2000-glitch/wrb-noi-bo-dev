/*
 * Component: MenuItem
 * Chức năng: Hiển thị một item trong menu với hình ảnh, tên, giá
 */

"use client";

import React, { useState } from 'react';

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
  available?: boolean;
}

interface MenuItemProps {
  item: MenuItemData;
  lang: string;
}

export default function MenuItem({ item, lang }: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Xác định locale dựa trên ngôn ngữ
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';

  // Check if item is available
  const isAvailable = item.available !== false;

  return (
    <div
      className={`relative group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        !isAvailable ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {item.price.toLocaleString(locale)} VND
        </div>

        {/* Availability Badge */}
        {!isAvailable && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            {lang === 'vi' ? 'Hết' : 'Unavailable'}
          </div>
        )}

        {/* Hover Overlay Content */}
        <div className={`absolute bottom-4 left-4 right-4 transform transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <button
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 ${
              !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isAvailable}
          >
            {lang === 'vi' ? 'Đặt lịch ngay' : 'Book Now'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
          {item.name}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Features/Highlights */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.8)</span>
          </div>

          <div className="text-xs text-gray-500">
            {lang === 'vi' ? '45 phút' : '45 min'}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-50"></div>
    </div>
  );
}