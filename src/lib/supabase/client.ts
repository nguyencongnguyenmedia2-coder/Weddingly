import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dspatvqqeqyajexbgxbl.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ndMFaNHBCOUirnVdfRdU-Q_JuQ2nhdv";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
