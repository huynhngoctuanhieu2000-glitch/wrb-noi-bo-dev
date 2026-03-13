
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Fetching 1 record from Bookings...');
    const { data, error } = await supabase.from('Bookings').select('*').limit(1).maybeSingle();
    if (error) {
        console.error('Error:', error.message);
    } else if (data) {
        console.log('Columns found:', Object.keys(data));
        console.log('Data:', data);
    } else {
        console.log('No data.');
    }
}

check();
