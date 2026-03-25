-- ============================================================
-- 🔒 MIGRATION: Thêm cột accessToken vào bảng Bookings
-- Mục đích: Bảo mật URL — dùng token ngẫu nhiên thay vì booking ID
-- Chạy trên: Supabase SQL Editor
-- Date: 2026-03-25
-- ============================================================

-- 1. Thêm cột accessToken (UUID ngẫu nhiên, unique)
ALTER TABLE public."Bookings"
ADD COLUMN IF NOT EXISTS "accessToken" text UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', '');

-- 2. Tạo index để query nhanh bằng accessToken
CREATE INDEX IF NOT EXISTS idx_bookings_access_token ON public."Bookings" ("accessToken");

-- 3. Cập nhật token cho tất cả đơn cũ (chưa có token)
UPDATE public."Bookings"
SET "accessToken" = replace(gen_random_uuid()::text, '-', '')
WHERE "accessToken" IS NULL;

-- 4. Đặt NOT NULL sau khi cập nhật xong
ALTER TABLE public."Bookings"
ALTER COLUMN "accessToken" SET NOT NULL;

-- ============================================================
-- ✅ XONG! Kiểm tra:
-- SELECT id, "billCode", "accessToken" FROM "Bookings" LIMIT 5;
-- ============================================================
