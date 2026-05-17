import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import JobCard from "@/components/ui/JobCard";
import SearchBar from "@/components/ui/SearchBar";
import FilterPanel from "@/components/ui/FilterPanel";
import type { JobListingWithEmployer, JobCategory } from "@/lib/types/database";

export const metadata = {
  title: "Browse Jobs — Utah Hospitality Insiders",
  description: "Find hospitality jobs across Utah — servers, bartenders, front desk, housekeeping, management, and more.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; type?: string; location?: string }>;
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
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false });

    if (params.q) {
      query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
    }

    if (params.type) {
      query = query.eq("job_type", params.type);
    }

    if (params.location) {
      query = query.ilike("location_city", `%${params.location}%`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Hospitality Jobs</h1>

      <div className="space-y-4 mb-8">
        <SearchBar defaultValue={params.q || ""} />
        <FilterPanel categories={categories} />
      </div>

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
            Try adjusting your search or filters, or check back soon for new listings.
          </p>
        </div>
      )}
    </div>
  );
}
