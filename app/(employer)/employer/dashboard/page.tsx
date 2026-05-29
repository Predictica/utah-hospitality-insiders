import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "./DashboardClient";
import DashboardProfile from "./DashboardProfile";

export const metadata = {
  title: "Employer Dashboard — Utah Hospitality Insiders",
};

export const dynamic = "force-dynamic";

interface DashboardListing {
  id: string;
  title: string;
  location_city: string | null;
  posted_at: string;
  expires_at: string;
  is_active: boolean;
  view_count: number;
  click_count: number;
}

export default async function EmployerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/employer/login");

  const { data: employerData } = await supabase
    .from("employers")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  const employer = employerData as unknown as {
    id: string;
    company_name: string;
    tier: string;
    email_verified: boolean;
    logo_url: string | null;
  } | null;

  if (!employer) redirect("/employer/register");

  // Fetch listings with view/click counts
  const { data: listingsData } = await supabase
    .from("job_listings")
    .select("id, title, location_city, posted_at, expires_at, is_active")
    .eq("employer_id", employer.id)
    .order("posted_at", { ascending: false });

  const listings = (listingsData as unknown as {
    id: string;
    title: string;
    location_city: string | null;
    posted_at: string;
    expires_at: string;
    is_active: boolean;
  }[]) || [];

  // Get view and click counts for each listing
  const listingIds = listings.map((l) => l.id);

  let viewCounts: Record<string, number> = {};
  let clickCounts: Record<string, number> = {};

  if (listingIds.length > 0) {
    const { data: views } = await supabase
      .from("listing_views")
      .select("listing_id")
      .in("listing_id", listingIds);

    const { data: clicks } = await supabase
      .from("listing_clicks")
      .select("listing_id")
      .in("listing_id", listingIds);

    if (views) {
      for (const v of views as unknown as { listing_id: string }[]) {
        viewCounts[v.listing_id] = (viewCounts[v.listing_id] || 0) + 1;
      }
    }

    if (clicks) {
      for (const c of clicks as unknown as { listing_id: string }[]) {
        clickCounts[c.listing_id] = (clickCounts[c.listing_id] || 0) + 1;
      }
    }
  }

  const dashboardListings: DashboardListing[] = listings.map((l) => ({
    ...l,
    view_count: viewCounts[l.id] || 0,
    click_count: clickCounts[l.id] || 0,
  }));

  const totalViews = dashboardListings.reduce((s, l) => s + l.view_count, 0);
  const totalClicks = dashboardListings.reduce((s, l) => s + l.click_count, 0);
  const activeListings = dashboardListings.filter((l) => l.is_active && new Date(l.expires_at) > new Date());

  const tierLabels: Record<string, string> = {
    free: "Free",
    standard: "Standard",
    sponsored: "Sponsored",
    premium_annual: "Premium",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {employer.company_name}
          </h1>
          <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-[#1F4E79]">
            {tierLabels[employer.tier] || employer.tier} Plan
          </span>
        </div>
        <Link
          href="/employer/post-job"
          className="bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors text-center"
        >
          Post a New Job
        </Link>
      </div>

      {!employer.email_verified && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mb-6">
          Your email has not been verified yet. Please check your inbox for the
          verification link. You must verify your email before posting jobs.
        </div>
      )}

      {/* Company Profile */}
      <DashboardProfile
        logoUrl={employer.logo_url}
        companyName={employer.company_name}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">
            {activeListings.length}
          </p>
          <p className="text-sm text-gray-500">Active Listings</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-[#1F4E79]">{totalViews}</p>
          <p className="text-sm text-gray-500">Total Views</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-green-700">{totalClicks}</p>
          <p className="text-sm text-gray-500">Total Clicks</p>
        </div>
      </div>

      {/* Listings */}
      {dashboardListings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">
            You haven&apos;t posted any jobs yet.
          </p>
          <Link
            href="/employer/post-job"
            className="inline-block bg-[#1F4E79] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#163a5c] transition-colors"
          >
            Post Your First Job
          </Link>
        </div>
      ) : (
        <DashboardClient listings={dashboardListings} />
      )}

      {/* Upgrade prompt for free tier */}
      {employer.tier === "free" && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-5 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Want more visibility? Upgrade to Standard or Sponsored to reach more
            candidates.
          </p>
          <Link
            href="/employers"
            className="text-[#1F4E79] text-sm font-medium hover:underline shrink-0 ml-4"
          >
            Learn More &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
