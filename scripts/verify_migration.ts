import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("🔍 Đang kiểm tra dữ liệu trên Supabase...");

    const { count: catCount, error: catError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

    if (catError) {
        console.error("❌ Lỗi kiểm tra categories:", catError.message);
        if (catError.message.includes("does not exist")) {
            console.log("💡 Gợi ý: Có vẻ bạn chưa chạy script SQL trong Supabase Dashboard.");
        }
    } else {
        console.log(`✅ Số lượng Categories: ${catCount}`);
    }

    const { count: srvCount, error: srvError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

    if (srvError) {
        console.error("❌ Lỗi kiểm tra services:", srvError.message);
    } else {
        console.log(`✅ Số lượng Services: ${srvCount}`);
    }
}

verify();
