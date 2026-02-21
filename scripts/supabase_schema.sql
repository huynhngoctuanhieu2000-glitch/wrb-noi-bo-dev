-- 0. (Tùy chọn) Xóa hết bảng cũ nếu bạn muốn làm lại từ đầu
-- DROP TABLE IF EXISTS booking_items;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS services;
-- DROP TABLE IF EXISTS categories;

-- 1. Bật extension cho UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Bảng Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_vn TEXT NOT NULL UNIQUE,
    name_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Services
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY, 
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    names JSONB NOT NULL, 
    descriptions JSONB,
    price_vn NUMERIC NOT NULL DEFAULT 0,
    price_usd NUMERIC NOT NULL DEFAULT 0,
    time_mins INTEGER DEFAULT 0,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_best_choice BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    focus_position JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Bookings (Đơn hàng)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_gender TEXT,
    total_amount NUMERIC NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Booking Items (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES services(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_booking NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TẮT BẢO MẬT RLS (Quan trọng để migrate dữ liệu)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items DISABLE ROW LEVEL SECURITY;

-- Note: Sau khi script migrate xong, mình sẽ hướng dẫn bạn bật lại RLS sau.
