/*
 * Component: MenuCategory
 * Chức năng: Hiển thị một danh mục món ăn với các item
 */

import React from 'react';
import MenuItem from './MenuItem';

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
  available?: boolean;
}

interface MenuCategoryData {
  id: string;
  name: string;
  order: number;
  items: MenuItemData[];
}

interface MenuCategoryProps {
  category: MenuCategoryData;
  lang: string;
}

export default function MenuCategory({ category, lang }: MenuCategoryProps) {
  // Filter available items
  const availableItems = category.items.filter(item => item.available !== false);

  if (availableItems.length === 0) {
    return null; // Don't show category if no items are available
  }

  return (
    <section className="mb-16">
      {/* Category Header */}
      <div className="relative mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-1 h-12 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              {category.name}
            </h2>
            <p className="text-gray-600">
              {lang === 'vi'
                ? `${availableItems.length} dịch vụ có sẵn`
                : `${availableItems.length} services available`
              }
            </p>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="absolute top-6 left-16 w-full h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent"></div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableItems.map((item) => (
          <MenuItem key={item.id} item={item} lang={lang} />
        ))}
      </div>

      {/* Category Footer */}
      <div className="mt-8 text-center">
        <button className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 group">
          <span>
            {lang === 'vi'
              ? 'Xem tất cả dịch vụ trong danh mục này'
              : 'View all services in this category'
            }
          </span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}