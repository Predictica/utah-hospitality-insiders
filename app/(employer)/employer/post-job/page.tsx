import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostJobForm from "./PostJobForm";

export const metadata = {
  title: "Post a Job — Utah Hospitality Insiders",
};

export const dynamic = "force-dynamic";

export default async function PostJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/employer/login");

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("job_categories")
    .select("id, name")
    .order("sort_order");

  const categories = (categoriesData as unknown as { id: string; name: string }[]) || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
      <p className="text-gray-500 text-sm mb-8">
        Fill out the details below to create a job listing. It will be live for
        30 days.
      </p>
      <PostJobForm categories={categories} />
    </div>
  );
}
