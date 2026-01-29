/*
 * File: Menu/utils.ts
 * Chức năng: Các utility functions cho Menu
 */

/**
 * Lấy label dịch vụ theo ngôn ngữ
 */
export function getServiceLabel(service: string, lang: string): string {
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

  return serviceLabels[service]?.[lang] || serviceLabels["old-user"][lang] || service;
}

/**
 * Validate menu data
 */
export function validateMenuData(data: any): boolean {
  if (!data || !Array.isArray(data.categories)) return false;

  return data.categories.every((category: any) =>
    category.id &&
    category.name &&
    Array.isArray(category.items) &&
    category.items.every((item: any) =>
      item.id && item.name && typeof item.price === 'number'
    )
  );
}