import { createClient } from "@supabase/supabase-js";

// ⚠️ REPLACE THESE with your actual Supabase Project credentials from the Dashboard
const SUPABASE_URL = "https://eijkcxmdkbidchvtrpim.supabase.co";
const SUPABASE_ANON_KEY =
  "  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpamtjeG1ka2JpZGNodnRycGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzkyOTcsImV4cCI6MjA3MzExNTI5N30.J7m1BMPtKhfc6GU-mI5TpsTTiid2LhwyblWI_uscAJQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
