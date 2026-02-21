-- 1. Thêm cột id_legacy và ràng buộc UNIQUE
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS id_legacy TEXT;
ALTER TABLE bookings ADD CONSTRAINT bookings_id_legacy_unique UNIQUE (id_legacy);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_lang TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS technician_code TEXT;

-- 2. Thêm cột options_snapshot vào bảng booking_items để lưu chi tiết các lựa chọn (strength, therapist, etc.)
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS options_snapshot JSONB;

-- 3. Đảm bảo RLS vẫn đang tắt để migrate (nếu cần)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items DISABLE ROW LEVEL SECURITY;
