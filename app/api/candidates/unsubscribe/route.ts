import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from("candidates")
      .update({ is_active: false, email_opted_in: false })
      .eq("email", email.toLowerCase());

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://utahhospitalityinsiders.com";

    return NextResponse.redirect(new URL("/candidates/unsubscribed", siteUrl));
  } catch (err) {
    console.error("[Unsubscribe] Error:", err);
    return Response.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
