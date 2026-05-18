import FirecrawlApp from "@mendable/firecrawl-js";

export interface ScrapedJob {
  title: string;
  location: string | null;
  job_type: "full_time" | "part_time" | "seasonal" | "gig" | null;
  description: string | null;
  application_url: string | null;
}

export async function scrapeJobsFromUrl(
  url: string,
  employerName: string
): Promise<ScrapedJob[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error(`[Scraper] FIRECRAWL_API_KEY not set`);
    return [];
  }

  const firecrawl = new FirecrawlApp({ apiKey });

  try {
    // Append cache-busting parameter so Firecrawl treats each run as a fresh request
    const cacheBustUrl = url.includes("?")
      ? `${url}&t=${Date.now()}`
      : `${url}?t=${Date.now()}`;

    console.log(`[Scraper] Scraping ${employerName}: ${cacheBustUrl}`);

    const scrapePromise = firecrawl.scrape(cacheBustUrl, {
      formats: [
        {
          type: "json",
          prompt: `Extract all job listings from this careers/jobs page. For each job, extract:
- title: the job title
- location: the city or location (Utah-specific if possible)
- job_type: one of "full_time", "part_time", "seasonal", or "gig" (infer from context, default to null if unclear)
- description: a brief description or snippet (first 500 chars)
- application_url: the direct link to apply for this specific job (full URL if available)

Return an array of job objects. Only include actual job postings, not navigation links or general content.`,
        },
      ],
      actions: [],
      skipTlsVerification: false,
      timeout: 45000,
    });

    // Abort if a single target takes longer than 60 seconds
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Scrape timed out after 60s")), 60000)
    );

    const response = await Promise.race([scrapePromise, timeout]);

    const jsonData = response.json;

    if (!jsonData) {
      console.log(`[Scraper] No JSON data returned for ${employerName}`);
      return [];
    }

    // The JSON response could be an array directly or wrapped in an object
    let jobs: ScrapedJob[] = [];

    if (Array.isArray(jsonData)) {
      jobs = jsonData;
    } else if (typeof jsonData === "object" && jsonData !== null) {
      // Look for an array property in the response
      const possibleArrayKeys = [
        "job_listings",
        "jobs",
        "listings",
        "positions",
        "results",
        "data",
        "openings",
        "vacancies",
      ];
      for (const key of possibleArrayKeys) {
        if (
          key in (jsonData as Record<string, unknown>) &&
          Array.isArray((jsonData as Record<string, unknown>)[key])
        ) {
          jobs = (jsonData as Record<string, unknown>)[key] as ScrapedJob[];
          break;
        }
      }
      // If still empty, try the object values
      if (jobs.length === 0) {
        const values = Object.values(jsonData as Record<string, unknown>);
        const arrValue = values.find((v) => Array.isArray(v));
        if (arrValue && Array.isArray(arrValue)) {
          jobs = arrValue as ScrapedJob[];
        }
      }
    }

    // Normalize and filter valid jobs
    const validJobs = jobs
      .filter(
        (job) => job && typeof job === "object" && job.title && job.title.trim()
      )
      .map((job) => ({
        title: String(job.title).trim(),
        location: job.location ? String(job.location).trim() : null,
        job_type: normalizeJobType(job.job_type),
        description: job.description
          ? String(job.description).slice(0, 500)
          : null,
        application_url: job.application_url
          ? String(job.application_url).trim()
          : null,
      }));

    console.log(
      `[Scraper] Found ${validJobs.length} jobs for ${employerName}`
    );
    return validJobs;
  } catch (error) {
    console.error(
      `[Scraper] Error scraping ${employerName}:`,
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

function normalizeJobType(
  type: string | null | undefined
): "full_time" | "part_time" | "seasonal" | "gig" | null {
  if (!type) return null;
  const normalized = String(type).toLowerCase().replace(/[\s-]/g, "_");
  const valid = ["full_time", "part_time", "seasonal", "gig"] as const;
  const match = valid.find((v) => normalized.includes(v));
  return match || null;
}
