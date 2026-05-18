import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_EMPLOYER_ROUTES = [
  "/employer/login",
  "/employer/register",
  "/employer/verify-email",
  "/employer/forgot-password",
  "/employer/reset-password",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseUrl.startsWith("http")
  ) {
    return supabaseResponse;
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
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /employer routes (except public auth pages)
  if (
    pathname.startsWith("/employer") &&
    !PUBLIC_EMPLOYER_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    if (!user) {
      const loginUrl = new URL("/employer/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If logged in and visiting login/register, redirect to dashboard
  if (
    user &&
    (pathname === "/employer/login" || pathname === "/employer/register")
  ) {
    return NextResponse.redirect(new URL("/employer/dashboard", request.url));
  }

  return supabaseResponse;
}
