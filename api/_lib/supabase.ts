import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabaseAdmin: SupabaseClient | null = null;

export const getSupabaseAdminClient = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  if (cachedSupabaseAdmin) return cachedSupabaseAdmin;

  cachedSupabaseAdmin = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedSupabaseAdmin;
};

export const isMissingTableError = (message: string) => {
  const lowered = message.toLowerCase();
  return lowered.includes("relation") || lowered.includes("does not exist") || lowered.includes("42p01");
};
