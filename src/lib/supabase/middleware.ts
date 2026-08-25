import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({ request });

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lqcyiixtdwsgnqjxhvmh.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3lpaXh0ZHdzZ25xanhodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODAxOTYsImV4cCI6MjEwMjk1NjE5Nn0.KU23YTro38S9BkIlOHi8NvWKf7jGEOunyrAyFJGrrig";

    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Safely attempt to refresh session without throwing unhandled rejection
    await supabase.auth.getUser().catch(() => null);

    return response;
  } catch (err) {
    console.error("[Middleware] Session update error:", err);
    return NextResponse.next({ request });
  }
}