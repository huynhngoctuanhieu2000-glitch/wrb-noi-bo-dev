
import { getSupabaseAdmin } from './src/lib/supabaseAdmin';
import dotenv from 'dotenv';
dotenv.config();

async function checkTable() {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        console.error('No supabase client');
        return;
    }
    
    console.log('Checking StaffNotifications table...');
    const { data, error } = await supabase
        .from('StaffNotifications')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching StaffNotifications:', error.message);
    } else {
        console.log('Success! Sample data:', data);
    }
}

checkTable();
