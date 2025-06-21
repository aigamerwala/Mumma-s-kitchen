import { createClient } from "@supabase/supabase-js";

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = "https://pcytcgnbepzumzndijcq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeXRjZ25iZXB6dW16bmRpamNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODEzNjIsImV4cCI6MjA2NjA1NzM2Mn0.-GEL9k-nfizrY0RFQZV_jTu9FS7N0UcjRrvhgCq1sPE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);