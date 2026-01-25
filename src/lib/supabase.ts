import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlngrjjwgbknjglhwsxj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmdyamp3Z2JrbmpnbGh3c3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMTA0MywiZXhwIjoyMDg0ODc3MDQzfQ.cBWCaUNTx1KQBPzDjKnRr2MVH13TdVlDReLpzg2CvZU'

export const supabase = createClient(supabaseUrl, supabaseKey)
