import type { JobListing } from "@/lib/types/database";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://utahhospitalityinsiders.com";

function formatPay(listing: JobListing): string {
  if (!listing.pay_min && !listing.pay_max) return "";
  const type =
    listing.pay_type === "hourly"
      ? "/hr"
      : listing.pay_type === "salary"
      ? "/yr"
      : listing.pay_type === "tips_plus"
      ? "/hr + tips"
      : "";
  if (listing.pay_min && listing.pay_max) {
    return `$${listing.pay_min}–$${listing.pay_max}${type}`;
  }
  if (listing.pay_min) return `From $${listing.pay_min}${type}`;
  return `Up to $${listing.pay_max}${type}`;
}

function formatJobType(type: string | null): string {
  if (!type) return "";
  const map: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    seasonal: "Seasonal",
    gig: "Gig / Contract",
  };
  return map[type] || type;
}

function jobRow(job: JobListing & { employers?: { company_name: string } | null }): string {
  const employer =
    job.employers?.company_name || job.employer_name || "Utah Hospitality Insiders";
  const pay = formatPay(job);
  const jobType = formatJobType(job.job_type);
  const location = job.location_city || "Utah";

  return `
    <tr>
      <td style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #1F4E79; font-weight: 600;">${job.title}</h3>
              <p style="margin: 0 0 6px 0; font-size: 14px; color: #374151; font-weight: 500;">${employer}</p>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                ${location}${jobType ? ` &bull; ${jobType}` : ""}${pay ? ` &bull; ${pay}` : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 12px;">
              <a href="${SITE_URL}/jobs/${job.id}"
                 style="display: inline-block; background-color: #1F4E79; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 20px; border-radius: 6px;">
                View Job
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function emailWrapper(content: string, unsubscribeEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1F4E79; padding: 24px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 700;">Utah Hospitality Insiders</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd;">Job Alerts</p>
            </td>
          </tr>
          <!-- Content -->
          ${content}
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">
                You're receiving this because you signed up for job alerts at Utah Hospitality Insiders.
              </p>
              <a href="${SITE_URL}/api/candidates/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}"
                 style="font-size: 12px; color: #6b7280; text-decoration: underline;">
                Unsubscribe from job alerts
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── 3A: Job Alert Email ──────────────────────────────────────────────

export function jobAlertEmail(
  jobs: (JobListing & { employers?: { company_name: string } | null })[],
  candidateName: string,
  email: string
): { subject: string; html: string } {
  const firstName = candidateName.split(" ")[0] || "there";
  const jobRows = jobs.map(jobRow).join("");

  const content = `
    <tr>
      <td style="padding: 24px 24px 8px 24px;">
        <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Hi ${firstName}, here are new Utah hospitality jobs matching your preferences:
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${jobRows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 24px; text-align: center;">
        <a href="${SITE_URL}/jobs"
           style="font-size: 14px; color: #1F4E79; font-weight: 600; text-decoration: none;">
          Browse all jobs &rarr;
        </a>
      </td>
    </tr>`;

  return {
    subject: "New Utah Hospitality Jobs Matching Your Preferences",
    html: emailWrapper(content, email),
  };
}

// ── 3B: Welcome Email ────────────────────────────────────────────────

export function welcomeEmail(
  candidateName: string,
  email: string
): { subject: string; html: string } {
  const firstName = candidateName.split(" ")[0] || "there";

  const content = `
    <tr>
      <td style="padding: 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1F4E79;">Welcome, ${firstName}!</h2>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Thanks for signing up for Utah Hospitality Insiders job alerts. We'll send you notifications when new hospitality jobs are posted that match your preferences.
        </p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Here's what to expect:
        </p>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 14px; color: #374151; line-height: 1.8;">
          <li><strong>Instant alerts</strong> for featured job postings that match your profile</li>
          <li><strong>Daily digest</strong> with all new listings from the past 24 hours</li>
        </ul>
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          You can update your preferences at any time to refine the jobs you see.
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-radius: 6px; background-color: #1F4E79;">
              <a href="${SITE_URL}/candidates"
                 style="display: inline-block; padding: 12px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                Customize Preferences
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return {
    subject: "Welcome to Utah Hospitality Insiders Job Alerts",
    html: emailWrapper(content, email),
  };
}

// ── Listing Pending Email (to employer) ──────────────────────────────

export function listingPendingEmail(
  employerName: string,
  jobTitle: string,
  companyName: string
): { subject: string; html: string } {
  const content = `
    <tr>
      <td style="padding: 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1F4E79;">Your Listing is Pending Review</h2>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Hi ${employerName.split(" ")[0] || "there"},
        </p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Your job listing <strong>"${jobTitle}"</strong> for ${companyName} has been submitted and is pending review by our team.
        </p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Free listings are typically reviewed and approved within 24 hours. We'll notify you by email once your listing is live.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          You can check the status of your listing on your dashboard at any time.
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-radius: 6px; background-color: #1F4E79;">
              <a href="${SITE_URL}/employer/dashboard"
                 style="display: inline-block; padding: 12px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                View Dashboard
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return {
    subject: "Your Job Listing is Pending Review — Utah Hospitality Insiders",
    html: emailWrapper(content, ""),
  };
}

// ── Admin New Listing Email ──────────────────────────────────────────

export function adminNewListingEmail(
  jobTitle: string,
  companyName: string,
  employerEmail: string,
  adminUrl: string
): { subject: string; html: string } {
  const content = `
    <tr>
      <td style="padding: 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1F4E79;">New Listing Pending Approval</h2>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; line-height: 1.6;">
          A new job listing has been submitted and needs your review:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0; background-color: #f9fafb; border-radius: 8px;">
          <tr><td style="padding: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1F4E79; font-weight: 600;">${jobTitle}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #374151;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Employer Email:</strong> ${employerEmail}</p>
          </td></tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-radius: 6px; background-color: #1F4E79;">
              <a href="${adminUrl}"
                 style="display: inline-block; padding: 12px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                Review in Admin
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return {
    subject: "New Job Listing Pending Approval",
    html: emailWrapper(content, ""),
  };
}

// ── 3C: Daily Digest Email ───────────────────────────────────────────

export function dailyDigestEmail(
  jobs: (JobListing & { employers?: { company_name: string } | null })[],
  date: string,
  email: string
): { subject: string; html: string } {
  const jobRows = jobs.map(jobRow).join("");

  const content = `
    <tr>
      <td style="padding: 24px 24px 8px 24px;">
        <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">
          Here are today's new Utah hospitality job openings:
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${jobRows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 24px; text-align: center;">
        <a href="${SITE_URL}/jobs"
           style="font-size: 14px; color: #1F4E79; font-weight: 600; text-decoration: none;">
          Browse all jobs &rarr;
        </a>
      </td>
    </tr>`;

  return {
    subject: `Utah Hospitality Insider Job Alerts — ${date}`,
    html: emailWrapper(content, email),
  };
}
