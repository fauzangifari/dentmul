import { createClient } from "@supabase/supabase-js";

// Supabase Client Server-side ONLY
// Menggunakan Service Role Key untuk bypass RLS, pastikan tidak terekspos ke frontend!
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
