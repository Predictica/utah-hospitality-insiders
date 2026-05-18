import { createClient } from "@supabase/supabase-js";
import { scrapeJobsFromUrl } from "./firecrawl";

export interface ScrapeResult {
  targetsChecked: number;
  targetsScraped: number;
  jobsFound: number;
  jobsInserted: number;
  errors: string[];
  details: { employer: string; found: number; inserted: number; error?: string }[];
}

export async function runScrapeJob(): Promise<ScrapeResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const result: ScrapeResult = {
    targetsChecked: 0,
    targetsScraped: 0,
    jobsFound: 0,
    jobsInserted: 0,
    errors: [],
    details: [],
  };

  // Fetch active scrape targets
  const { data: targets, error: targetsError } = await supabase
    .from("scrape_targets")
    .select("*")
    .eq("is_active", true);

  if (targetsError || !targets) {
    result.errors.push(`Failed to fetch scrape targets: ${targetsError?.message}`);
    return result;
  }

  result.targetsChecked = targets.length;

  for (const target of targets) {
    const detail: { employer: string; found: number; inserted: number; error?: string } = {
      employer: target.employer_name,
      found: 0,
      inserted: 0,
    };

    try {
      // Check if scraping is due
      if (target.last_scraped_at) {
        const lastScraped = new Date(target.last_scraped_at);
        const hoursAgo = (Date.now() - lastScraped.getTime()) / (1000 * 60 * 60);
        if (hoursAgo < (target.scrape_frequency_hours || 24)) {
          console.log(
            `[Runner] Skipping ${target.employer_name} — scraped ${hoursAgo.toFixed(1)}h ago`
          );
          result.details.push(detail);
          continue;
        }
      }

      result.targetsScraped++;

      const jobs = await scrapeJobsFromUrl(
        target.careers_page_url,
        target.employer_name
      );

      detail.found = jobs.length;
      result.jobsFound += jobs.length;

      for (const job of jobs) {
        // Check for duplicates by title + scraped_source_url
        const { data: existing } = await supabase
          .from("job_listings")
          .select("id")
          .eq("title", job.title)
          .eq("scraped_source_url", target.careers_page_url)
          .limit(1);

        if (existing && existing.length > 0) {
          continue;
        }

        const { error: insertError } = await supabase
          .from("job_listings")
          .insert({
            title: job.title,
            description: job.description,
            employer_name: target.employer_name,
            location_city: job.location,
            location_region: job.location,
            job_type: job.job_type,
            application_url: job.application_url,
            application_method: job.application_url ? "external_link" : null,
            source: "scraped",
            scraped_source_url: target.careers_page_url,
            is_active: true,
            is_featured: false,
            posted_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });

        if (insertError) {
          console.error(
            `[Runner] Insert error for "${job.title}":`,
            insertError.message
          );
        } else {
          detail.inserted++;
          result.jobsInserted++;
        }
      }

      // Update last_scraped_at
      await supabase
        .from("scrape_targets")
        .update({ last_scraped_at: new Date().toISOString() })
        .eq("id", target.id);
    } catch (error) {
      const errMsg = `${target.employer_name}: ${error instanceof Error ? error.message : String(error)}`;
      detail.error = errMsg;
      result.errors.push(errMsg);
      console.error(`[Runner] Error for ${target.employer_name}:`, error);
    }

    result.details.push(detail);
  }

  console.log(
    `[Runner] Scrape complete: ${result.targetsScraped}/${result.targetsChecked} targets, ${result.jobsFound} found, ${result.jobsInserted} inserted`
  );

  return result;
}
