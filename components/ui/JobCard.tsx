import Link from "next/link";
import type { JobListingWithEmployer } from "@/lib/types/database";

function formatJobType(type: string | null): string {
  if (!type) return "";
  const map: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    seasonal: "Seasonal",
    gig: "Gig",
  };
  return map[type] || type;
}

function formatPay(listing: JobListingWithEmployer): string | null {
  if (!listing.pay_min && !listing.pay_max) return null;
  const suffix = listing.pay_type === "hourly" ? "/hr" : listing.pay_type === "salary" ? "/yr" : "";
  if (listing.pay_min && listing.pay_max) {
    return `$${listing.pay_min}–$${listing.pay_max}${suffix}`;
  }
  return `$${listing.pay_min || listing.pay_max}${suffix}`;
}

function isNew(postedAt: string): boolean {
  const posted = new Date(postedAt);
  const now = new Date();
  return now.getTime() - posted.getTime() < 48 * 60 * 60 * 1000;
}

export default function JobCard({ listing }: { listing: JobListingWithEmployer }) {
  const pay = formatPay(listing);
  const posted = new Date(listing.posted_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/jobs/${listing.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate">{listing.title}</h3>
          {listing.employers && (
            <p className="text-[#1F4E79] font-medium text-sm mt-0.5">
              {listing.employers.company_name}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {listing.is_featured && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {isNew(listing.posted_at) && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
              New
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
        {listing.location_city && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location_city}
          </span>
        )}
        {listing.job_type && (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
            {formatJobType(listing.job_type)}
          </span>
        )}
        {pay && (
          <span className="text-green-700 font-medium">{pay}</span>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">Posted {posted}</p>
    </Link>
  );
}
