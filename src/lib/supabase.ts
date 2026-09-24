import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabasePublishableKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseClient = createClient(
      supabaseUrl,
      supabasePublishableKey
    );
  }

  return supabaseClient;
}