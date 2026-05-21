import { NextRequest } from "next/server";
import { sendDailyDigest } from "@/lib/email/alerts";

const SCRAPE_TOKEN = process.env.SCRAPE_SECRET_TOKEN || "utah-hospitality-insiders-scrape-2026";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-scrape-token");
    // Also accept Vercel cron (no token needed from Vercel's internal cron runner)
    const isVercelCron = request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

    if (token !== SCRAPE_TOKEN && !isVercelCron) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sent = await sendDailyDigest();

    return Response.json({ success: true, sent });
  } catch (err) {
    console.error("[Digest] Error:", err);
    return Response.json({ error: "Failed to send digest" }, { status: 500 });
  }
}
