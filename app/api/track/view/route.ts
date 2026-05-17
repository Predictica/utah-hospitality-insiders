import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { listing_id } = await request.json();

  if (!listing_id) {
    return NextResponse.json({ error: "listing_id required" }, { status: 400 });
  }

  const ip_address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const user_agent = request.headers.get("user-agent") || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("listing_views")
    .select("id")
    .eq("listing_id", listing_id)
    .eq("ip_address", ip_address)
    .gte("viewed_at", twentyFourHoursAgo)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ tracked: false, reason: "duplicate" });
  }

  await supabase.from("listing_views").insert({
    listing_id,
    ip_address,
    user_agent,
  });

  return NextResponse.json({ tracked: true });
}
