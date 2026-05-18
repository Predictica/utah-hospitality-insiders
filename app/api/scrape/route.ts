import { NextRequest, NextResponse } from "next/server";
import { runScrapeJob } from "@/lib/scraper/runner";

export const maxDuration = 300; // Allow up to 5 minutes for scraping

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-scrape-token");
  const expectedToken = process.env.SCRAPE_SECRET_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScrapeJob();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Scrape API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Scrape failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
