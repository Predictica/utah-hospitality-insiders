import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import EmployersClient from "./EmployersClient";

export const metadata = {
  title: "Employers Admin — Utah Hospitality Insiders",
};

export const dynamic = "force-dynamic";

export default async function AdminEmployersPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: employers } = await supabase
    .from("employers")
    .select("*")
    .order("created_at", { ascending: false });

  // Get listing counts per employer
  const { data: listings } = await supabase
    .from("job_listings")
    .select("employer_id")
    .not("employer_id", "is", null);

  const listingCounts: Record<string, number> = {};
  if (listings) {
    for (const l of listings as unknown as { employer_id: string }[]) {
      listingCounts[l.employer_id] = (listingCounts[l.employer_id] || 0) + 1;
    }
  }

  interface EmployerRow {
    id: string;
    company_name: string;
    email: string;
    tier: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
    listing_count: number;
  }

  const employerRows: EmployerRow[] = ((employers as unknown as {
    id: string;
    company_name: string;
    email: string;
    tier: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
  }[]) || []).map((e) => ({
    ...e,
    listing_count: listingCounts[e.id] || 0,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Employer Admin
          </h1>
          <p className="text-gray-500 text-sm">
            Manage registered employers.
          </p>
        </div>
        <Link
          href="/admin/scrape"
          className="text-[#1F4E79] text-sm font-medium hover:underline"
        >
          Scraper Admin &rarr;
        </Link>
      </div>

      <EmployersClient employers={employerRows} />
    </div>
  );
}
