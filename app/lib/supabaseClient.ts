import { createClient } from '@supabase/supabase-js';

// Environment Variables များ မရှိခဲ့လျှင် Error မတက်စေရန် Empty string "" ထည့်ပေးထားခြင်း
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase Client ကို Initialize လုပ်ခြင်း
export const supabase = createClient(supabaseUrl, supabaseAnonKey);