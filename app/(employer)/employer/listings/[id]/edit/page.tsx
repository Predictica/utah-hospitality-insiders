import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PostJobForm from "../../../post-job/PostJobForm";

export const metadata = {
  title: "Edit Listing — Utah Hospitality Insiders",
};

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/employer/login");

  // Get employer record
  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const employer = employerData as unknown as { id: string } | null;
  if (!employer) redirect("/employer/register");

  // Get listing and verify ownership
  const { data: listingData } = await supabase
    .from("job_listings")
    .select(
      "id, title, category_id, job_type, location_city, location_region, pay_min, pay_max, pay_type, description, application_method, application_url, employer_id"
    )
    .eq("id", id)
    .single();

  const listing = listingData as unknown as {
    id: string;
    title: string;
    category_id: string | null;
    job_type: string | null;
    location_city: string | null;
    location_region: string | null;
    pay_min: number | null;
    pay_max: number | null;
    pay_type: string | null;
    description: string | null;
    application_method: string | null;
    application_url: string | null;
    employer_id: string;
  } | null;

  if (!listing) notFound();
  if (listing.employer_id !== employer.id) notFound();

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("job_categories")
    .select("id, name")
    .order("sort_order");

  const categories =
    (categoriesData as unknown as { id: string; name: string }[]) || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
      <p className="text-gray-500 text-sm mb-8">
        Update your job listing details below.
      </p>
      <PostJobForm categories={categories} initialData={listing} />
    </div>
  );
}
