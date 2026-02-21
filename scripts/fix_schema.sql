-- 1. Thêm ràng buộc UNIQUE cho name_vn nếu chưa có
ALTER TABLE categories ADD CONSTRAINT categories_name_vn_key UNIQUE (name_vn);

-- 2. Đảm bảo RLS được tắt để migrate
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items DISABLE ROW LEVEL SECURITY;
