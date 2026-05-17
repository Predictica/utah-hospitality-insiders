import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", email.toLowerCase())
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ exists: true });
  }

  const { error } = await supabase.from("candidates").insert({
    first_name: "",
    last_name: "",
    email: email.toLowerCase(),
    email_opted_in: true,
  });

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
