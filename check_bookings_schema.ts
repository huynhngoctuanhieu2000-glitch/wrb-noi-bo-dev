
import { getSupabaseAdmin } from './src/lib/supabaseAdmin';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        console.error('No supabase client');
        return;
    }
    
    console.log('Fetching sample record from Bookings...');
    const { data, error } = await supabase
        .from('Bookings')
        .select('*')
        .limit(1)
        .maybeSingle();
    
    if (error) {
        console.error('Error fetching Bookings:', error.message);
    } else if (data) {
        console.log('Success! Sample data keys:', Object.keys(data));
        console.log('Sample data:', data);
    } else {
        console.log('No data found in Bookings.');
    }
}

checkSchema();
