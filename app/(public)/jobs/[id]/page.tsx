import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { JobListing } from "@/lib/types/database";
import ViewTracker from "@/components/ui/ViewTracker";
import ApplyButton from "@/components/ui/ApplyButton";
import QuickAlertSignup from "@/components/ui/QuickAlertSignup";

interface JobListingDetail extends JobListing {
  employers: { company_name: string; website: string | null } | null;
  job_categories: { name: string } | null;
}

async function getListing(id: string): Promise<JobListingDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_listings")
    .select("*, employers(company_name, website), job_categories(name)")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  return data as unknown as JobListingDetail | null;
}

function getEmployerName(listing: JobListingDetail): string {
  if (listing.employers) return listing.employers.company_name;
  if (listing.employer_name) return listing.employer_name;
  return "Utah Hospitality Insiders";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Job Not Found | Utah Hospitality Insiders" };

  const employer = getEmployerName(listing);
  const title = `${listing.title} at ${employer} | Utah Hospitality Insiders`;

  return {
    title,
    description: listing.description?.slice(0, 160) || `View this ${listing.title} position in Utah.`,
    openGraph: { title, type: "website" },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const displayEmployerName = getEmployerName(listing);

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    seasonal: "Seasonal",
    gig: "Gig",
  };

  const payTypeLabels: Record<string, string> = {
    hourly: "/hr",
    salary: "/yr",
    tips_plus: " + tips",
  };

  const postedDate = new Date(listing.posted_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const expiresDate = new Date(listing.expires_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ViewTracker listingId={listing.id} />

      <Link href="/jobs" className="text-[#1F4E79] text-sm hover:underline mb-6 inline-block">
        &larr; Back to Jobs
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
          {listing.is_featured && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded shrink-0">
              Featured
            </span>
          )}
        </div>

        {listing.employers ? (
          <div className="mt-1">
            <span className="text-[#1F4E79] font-medium">
              {listing.employers.company_name}
            </span>
            {listing.employers.website && (
              <a
                href={listing.employers.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-[#1F4E79] ml-2"
              >
                Visit website &rarr;
              </a>
            )}
          </div>
        ) : (
          <p className="mt-1 text-[#1F4E79] font-medium">{displayEmployerName}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4 text-sm">
          {listing.location_city && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {listing.location_city}
              {listing.location_region ? `, ${listing.location_region}` : ""}
            </span>
          )}
          {listing.job_type && (
            <span className="bg-blue-50 text-[#1F4E79] px-3 py-1 rounded-full">
              {jobTypeLabels[listing.job_type] || listing.job_type}
            </span>
          )}
          {listing.job_categories && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {listing.job_categories.name}
            </span>
          )}
        </div>

        {(listing.pay_min || listing.pay_max) && (
          <p className="mt-4 text-lg text-green-700 font-semibold">
            {listing.pay_min && listing.pay_max
              ? `$${listing.pay_min}–$${listing.pay_max}`
              : `$${listing.pay_min || listing.pay_max}`}
            {listing.pay_type ? payTypeLabels[listing.pay_type] : ""}
          </p>
        )}

        {listing.description && (
          <div className="mt-6 prose prose-sm text-gray-700 max-w-none">
            <p className="whitespace-pre-wrap">{listing.description}</p>
          </div>
        )}

        {listing.application_url && (
          <div className="mt-8">
            <ApplyButton
              listingId={listing.id}
              applicationUrl={listing.application_url}
              label={listing.source === "scraped" ? "View Full Job Details & Apply" : "Apply Now"}
              note={listing.source === "scraped" ? "This will take you to the employer's careers page to view the complete job description and apply." : undefined}
            />
          </div>
        )}

        <div className="flex gap-4 text-xs text-gray-400 mt-8">
          <span>Posted {postedDate}</span>
          <span>Expires {expiresDate}</span>
        </div>
      </div>

      <div className="mt-6">
        <QuickAlertSignup />
      </div>
    </div>
  );
}
