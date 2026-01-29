/*
 * File: Menu/types.ts
 * Chức năng: Định nghĩa các interface và type cho Menu
 */

export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
  available?: boolean;
}

export interface MenuCategoryData {
  id: string;
  name: string;
  order: number;
  items: MenuItemData[];
}

export interface MenuData {
  categories: MenuCategoryData[];
  lastUpdated: string;
  version: string;
}

export type SupportedLanguage = 'vi' | 'en' | 'jp' | 'kr' | 'cn';

export type ServiceType = 'new-user' | 'old-user' | 'vip';