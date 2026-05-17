import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { JobListing } from "@/lib/types/database";

interface JobListingDetail extends JobListing {
  employers: { company_name: string; website: string | null } | null;
  job_categories: { name: string } | null;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();

  const { data } = await supabase
    .from("job_listings")
    .select("*, employers(company_name, website), job_categories(name)")
    .eq("id", id)
    .single();

  const listing = data as unknown as JobListingDetail | null;

  if (!listing) notFound();

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/jobs" className="text-[#1F4E79] text-sm hover:underline mb-6 inline-block">
        &larr; Back to Jobs
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>

        {listing.employers && (
          <p className="text-[#1F4E79] font-medium mt-1">
            {listing.employers.company_name}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          {listing.location_city && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {listing.location_city}{listing.location_region ? `, ${listing.location_region}` : ""}
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
          <a
            href={listing.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-[#1F4E79] text-white px-8 py-3 rounded-lg hover:bg-[#163a5c] transition-colors font-medium"
          >
            Apply Now
          </a>
        )}

        <p className="text-xs text-gray-400 mt-8">
          Posted {new Date(listing.posted_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
