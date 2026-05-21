import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendJobAlert } from "@/lib/email/alerts";
import type { JobListing } from "@/lib/types/database";

const SCRAPE_TOKEN = process.env.SCRAPE_SECRET_TOKEN || "utah-hospitality-insiders-scrape-2026";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-scrape-token");
    if (token !== SCRAPE_TOKEN) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listing_id } = await request.json();

    if (!listing_id) {
      return Response.json({ error: "listing_id is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: listing, error } = await supabase
      .from("job_listings")
      .select("*, employers(company_name)")
      .eq("id", listing_id)
      .single();

    if (error || !listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    const sent = await sendJobAlert(
      listing as unknown as JobListing & { employers?: { company_name: string } | null }
    );

    return Response.json({ success: true, sent });
  } catch (err) {
    console.error("[Alerts Send] Error:", err);
    return Response.json({ error: "Failed to send alerts" }, { status: 500 });
  }
}
