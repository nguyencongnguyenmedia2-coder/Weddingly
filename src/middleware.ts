import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase keys are not configured or using default mock in dev, allow smooth browsing
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("mock-wedding")) {
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
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected paths
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

  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth paths when already logged in
  const isAuthPath =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
