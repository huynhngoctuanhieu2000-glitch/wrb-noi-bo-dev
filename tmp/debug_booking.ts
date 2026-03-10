
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugBooking(id: string) {
  console.log(`Searching for Booking ID: ${id}`);
  
  const { data, error } = await supabase
    .from('Bookings')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} records.`);
  if (data.length > 0) {
    console.log('Record details:', data[0]);
  } else {
    console.log('No record found with this ID.');
  }
}

const targetId = process.argv[2] || '006-09032026';
debugBooking(targetId);
