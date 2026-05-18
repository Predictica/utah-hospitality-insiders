import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/employer/dashboard";

  if (!code) {
    // No code present — redirect to login with error
    return NextResponse.redirect(
      new URL("/employer/login?error=missing_code", origin)
    );
  }

  // Build a Supabase client that can set cookies on the response
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[Auth Callback] Code exchange failed:", error?.message);
    return NextResponse.redirect(
      new URL("/employer/login?error=verification_failed", origin)
    );
  }

  // Mark the employer's email as verified in our employers table
  try {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await adminSupabase
      .from("employers")
      .update({ email_verified: true })
      .eq("auth_user_id", data.user.id);
  } catch (err) {
    console.error("[Auth Callback] Failed to update email_verified:", err);
    // Non-fatal — the user is still authenticated, they just won't have
    // email_verified=true until we fix it. Continue to redirect.
  }

  // Redirect to dashboard (or wherever `next` points)
  const redirectUrl = new URL(next, origin);
  const redirectResponse = NextResponse.redirect(redirectUrl);

  // Copy all cookies from the exchange response to the redirect response
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });

  return redirectResponse;
}
