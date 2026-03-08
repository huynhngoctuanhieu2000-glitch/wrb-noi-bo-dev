
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase
    .from('Bookings')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching Bookings:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Columns in Bookings:', Object.keys(data[0]))
  } else {
    console.log('No data in Bookings to check columns.')
  }
}

checkColumns()
