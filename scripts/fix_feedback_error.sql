-- SCRIPT SQL ĐỂ SỬA LỖI GỬI ĐÁNH GIÁ
-- Nguyên nhân: Trigger database truy cập vào cột feedbackNote không tồn tại.

ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "feedbackNote" TEXT;

-- Kiểm tra lại các cột cần thiết cho hệ thống tính toán (nếu có)
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "tipAmount" NUMERIC DEFAULT 0;
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "violations" INTEGER[] DEFAULT '{}';
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
