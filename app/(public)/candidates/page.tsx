import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { JobCategory } from "@/lib/types/database";
import type { Metadata } from "next";
import CandidateSignupClient from "./CandidateSignupClient";

export const metadata: Metadata = {
  title: "Get Job Alerts — Utah Hospitality Insiders",
  description:
    "Sign up for free personalized job alerts and get notified when new hospitality jobs matching your preferences are posted in Utah.",
  openGraph: {
    title: "Get Free Job Alerts — Utah Hospitality Insiders",
    description: "Join Utah's hospitality community. Get notified the moment jobs matching your skills are posted.",
    type: "website",
  },
};

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  let categories: JobCategory[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_categories")
      .select("*")
      .order("sort_order");
    categories = (data as unknown as JobCategory[]) || [];
  }

  return (
    <CandidateSignupClient
      categories={categories}
      prefillEmail={params.email || ""}
    />
  );
}
