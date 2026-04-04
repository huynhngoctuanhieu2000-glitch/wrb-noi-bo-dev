-- Chạy script này trong SQL Editor của Supabase để thêm cấu hình mức giá VIP theo giờ
INSERT INTO public."SystemConfigs" (id, key, value, description, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    'vip_price_per_60min', 
    '"200000"', 
    'Giá tiền dịch vụ VIP cho mỗi 60 phút (Căn cứ để tự động chia theo số phút khách đặt)', 
    now(), 
    now()
)
ON CONFLICT (key) DO UPDATE 
SET 
    value = '"200000"', 
    description = 'Giá tiền dịch vụ VIP cho mỗi 60 phút (Căn cứ để tự động chia theo số phút khách đặt)',
    updated_at = now();
