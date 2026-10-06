import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let user = null;
    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("mock-wedding")) {
      try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        });
        const res = await supabase.auth.getUser();
        user = res.data?.user;
      } catch (e) {
        // Fallback to cookie
      }
    }

    const pathname = request.nextUrl.pathname;
    const sessionCookie = request.cookies.get("weddingly_session");
    const isAuthenticated = Boolean(user || sessionCookie?.value);

    // Protected paths (Requires mandatory registration / login)
    const isProtectedPath =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/tasks") ||
      pathname.startsWith("/checklists") ||
      pathname.startsWith("/budget") ||
      pathname.startsWith("/expenses") ||
      pathname.startsWith("/payments") ||
      pathname.startsWith("/guests") ||
      pathname.startsWith("/tables") ||
      pathname.startsWith("/vendors") ||
      pathname.startsWith("/venues") ||
      pathname.startsWith("/contracts") ||
      pathname.startsWith("/timeline") ||
      pathname.startsWith("/wedding-day") ||
      pathname.startsWith("/notes") ||
      pathname.startsWith("/gallery") ||
      pathname.startsWith("/notifications") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/admin");

    if (isProtectedPath && !isAuthenticated) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("notice", "require_auth");
      return NextResponse.redirect(redirectUrl);
    }

    // Auth paths when already logged in
    const isAuthPath =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password";

    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (err) {
    console.warn("Middleware error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
