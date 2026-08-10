/* ═══════════════════════════════════════════════
   SUPABASE CLIENT
   Paste your project's URL + anon key below.
   Both are found in Supabase → Project Settings → API.
   The anon key is meant to be public — real protection
   comes from the Row Level Security policies in supabase/schema.sql.
═══════════════════════════════════════════════ */
const SUPABASE_URL      = 'https://yabmzfkewkkltpjyrvcu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-MIqJXVDj9UmfHcN5Zk_vg_pRl9eQ0i';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
