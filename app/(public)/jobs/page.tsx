import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import JobCard from "@/components/ui/JobCard";
import SearchBar from "@/components/ui/SearchBar";
import FilterPanel from "@/components/ui/FilterPanel";
import QuickAlertSignup from "@/components/ui/QuickAlertSignup";
import Link from "next/link";
import type { JobListingWithEmployer, JobCategory } from "@/lib/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Utah Hospitality Jobs | Utah Hospitality Insiders",
  description: "Find hospitality jobs across Utah — servers, bartenders, front desk, housekeeping, management, and more.",
  openGraph: {
    title: "Browse Utah Hospitality Jobs | Utah Hospitality Insiders",
    description: "Find hotel, restaurant, and resort jobs across Utah.",
    type: "website",
  },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    job_type?: string;
    region?: string;
    pay_min?: string;
  }>;
}) {
  const params = await searchParams;

  let listings: JobListingWithEmployer[] = [];
  let categories: JobCategory[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();

    const { data: catData } = await supabase
      .from("job_categories")
      .select("*")
      .order("sort_order");

    categories = (catData as unknown as JobCategory[]) || [];

    let query = supabase
      .from("job_listings")
      .select("*, employers(company_name), job_categories(name, slug)")
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false });

    if (params.q) {
      query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
    }

    if (params.job_type) {
      query = query.eq("job_type", params.job_type);
    }

    if (params.region) {
      query = query.ilike("location_region", `%${params.region}%`);
    }

    if (params.pay_min) {
      query = query.gte("pay_min", Number(params.pay_min));
    }

    if (params.category && categories.length > 0) {
      const cat = categories.find((c) => c.slug === params.category);
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    const { data: listingData } = await query;
    listings = (listingData as unknown as JobListingWithEmployer[]) || [];
  }

  const hasFilters =
    params.category || params.job_type || params.region || params.pay_min;
  const resultLabel = params.q
    ? `${listings.length} job${listings.length !== 1 ? "s" : ""} found for "${params.q}"`
    : `${listings.length} job${listings.length !== 1 ? "s" : ""} found`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Hospitality Jobs</h1>

      <div className="mb-6">
        <SearchBar defaultValue={params.q || ""} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left sidebar: filters */}
        <aside className="lg:w-56 shrink-0">
          <FilterPanel categories={categories} />
        </aside>

        {/* Center: listings */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-4">{resultLabel}</p>

          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <JobCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-500">
                {hasFilters
                  ? "No jobs found matching your filters. Try adjusting your search."
                  : "Try adjusting your search or check back soon for new listings."}
              </p>
              {hasFilters && (
                <Link
                  href="/jobs"
                  className="mt-4 inline-block text-sm text-[#1F4E79] font-medium hover:underline"
                >
                  Clear Filters
                </Link>
              )}
            </div>
          )}

          {/* Mobile alert signup: below listings */}
          <div className="lg:hidden mt-8">
            <QuickAlertSignup />
          </div>
        </div>

        {/* Right sidebar: alert signup (desktop only) */}
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <div className="sticky top-20">
            <QuickAlertSignup />
          </div>
        </aside>
      </div>
    </div>
  );
}
