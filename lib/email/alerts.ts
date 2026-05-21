import { createClient } from "@supabase/supabase-js";
import { resend } from "./resend";
import {
  jobAlertEmail,
  dailyDigestEmail,
} from "./templates";
import type { JobListing, Candidate } from "@/lib/types/database";

const FROM_EMAIL = "Utah Hospitality Insiders <onboarding@resend.dev>";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── 4A: Match candidates to a listing ────────────────────────────────

type CandidateRow = Candidate;

export async function getMatchingCandidates(
  listing: JobListing
): Promise<CandidateRow[]> {
  const supabase = getAdminClient();

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("email_opted_in", true)
    .eq("is_active", true);

  if (error || !candidates) {
    console.error("[Alerts] Failed to fetch candidates:", error?.message);
    return [];
  }

  return (candidates as CandidateRow[]).filter((c) => {
    const hasCategories = c.preferred_categories && c.preferred_categories.length > 0;
    const hasLocations = c.preferred_locations && c.preferred_locations.length > 0;

    // Candidates with no preferences get everything
    if (!hasCategories && !hasLocations) return true;

    // If candidate has category prefs, listing must match one (or listing has no category)
    if (hasCategories && listing.category_id) {
      if (!c.preferred_categories.includes(listing.category_id)) return false;
    }

    // If candidate has location prefs, listing must match one (or listing has no region)
    if (hasLocations && listing.location_region) {
      if (!c.preferred_locations.includes(listing.location_region)) return false;
    }

    return true;
  });
}

// ── 4B: Send alert for a specific listing ────────────────────────────

export async function sendJobAlert(
  listing: JobListing & { employers?: { company_name: string } | null }
): Promise<number> {
  const supabase = getAdminClient();
  const candidates = await getMatchingCandidates(listing);

  if (candidates.length === 0) {
    console.log("[Alerts] No matching candidates for listing:", listing.id);
    return 0;
  }

  let sentCount = 0;

  for (const candidate of candidates) {
    try {
      // Check if we already sent this listing to this candidate
      const { data: existing } = await supabase
        .from("alert_sends")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("candidate_id", candidate.id)
        .eq("channel", "email")
        .limit(1);

      if (existing && existing.length > 0) continue;

      const candidateName =
        [candidate.first_name, candidate.last_name].filter(Boolean).join(" ") ||
        "there";

      const { subject, html } = jobAlertEmail([listing], candidateName, candidate.email);

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: candidate.email,
        subject,
        html,
      });

      const status = sendError ? "failed" : "sent";

      await supabase.from("alert_sends").insert({
        listing_id: listing.id,
        candidate_id: candidate.id,
        channel: "email",
        status,
      });

      if (!sendError) sentCount++;
      if (sendError) {
        console.error(
          `[Alerts] Failed to send to ${candidate.email}:`,
          sendError.message
        );
      }
    } catch (err) {
      console.error(
        `[Alerts] Error processing candidate ${candidate.id}:`,
        err
      );
      // Continue to next candidate — one failure should not stop others
    }
  }

  console.log(
    `[Alerts] Sent ${sentCount}/${candidates.length} alert emails for listing ${listing.id}`
  );
  return sentCount;
}

// ── 4C: Send daily digest ────────────────────────────────────────────

export async function sendDailyDigest(): Promise<number> {
  const supabase = getAdminClient();

  // Fetch listings posted in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: listings, error: listingsError } = await supabase
    .from("job_listings")
    .select("*, employers(company_name)")
    .eq("is_active", true)
    .gte("posted_at", since)
    .order("posted_at", { ascending: false });

  if (listingsError) {
    console.error("[Digest] Failed to fetch listings:", listingsError.message);
    return 0;
  }

  if (!listings || listings.length === 0) {
    console.log("[Digest] No new listings in the last 24 hours — skipping.");
    return 0;
  }

  // Fetch all opted-in candidates
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("*")
    .eq("email_opted_in", true)
    .eq("is_active", true);

  if (candidatesError || !candidates || candidates.length === 0) {
    console.log("[Digest] No active candidates to email.");
    return 0;
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let sentCount = 0;

  for (const candidate of candidates as CandidateRow[]) {
    try {
      const { subject, html } = dailyDigestEmail(
        listings as (JobListing & { employers?: { company_name: string } | null })[],
        today,
        candidate.email
      );

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: candidate.email,
        subject,
        html,
      });

      if (!sendError) {
        sentCount++;
        // Record a digest send for each listing included
        for (const listing of listings) {
          await supabase.from("alert_sends").insert({
            listing_id: (listing as { id: string }).id,
            candidate_id: candidate.id,
            channel: "email",
            status: "sent",
          });
        }
      } else {
        console.error(
          `[Digest] Failed to send to ${candidate.email}:`,
          sendError.message
        );
      }
    } catch (err) {
      console.error(
        `[Digest] Error processing candidate ${candidate.id}:`,
        err
      );
    }
  }

  console.log(
    `[Digest] Sent ${sentCount}/${candidates.length} digest emails with ${listings.length} listings`
  );
  return sentCount;
}
