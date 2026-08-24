import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lqcyiixtdwsgnqjxhvmh.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3lpaXh0ZHdzZ25xanhodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODAxOTYsImV4cCI6MjEwMjk1NjE5Nn0.KU23YTro38S9BkIlOHi8NvWKf7jGEOunyrAyFJGrrig";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}