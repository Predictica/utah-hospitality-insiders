import { createClient } from "@supabase/supabase-js";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "Admin Dashboard — Utah Hospitality Insiders",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // KPI queries in parallel
  const [
    { count: activeJobs },
    { count: pendingJobs },
    { count: totalEmployers },
    { count: totalCandidates },
    { count: publishedPosts },
    { data: pendingListings },
  ] = await Promise.all([
    supabase.from("job_listings").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("job_listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("employers").select("id", { count: "exact", head: true }),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("job_listings").select("id, title, employer_id, posted_at, employers(company_name)").eq("status", "pending").order("posted_at", { ascending: true }).limit(20),
  ]);

  // Jobs posted this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: jobsThisWeek } = await supabase
    .from("job_listings")
    .select("id", { count: "exact", head: true })
    .gte("posted_at", weekAgo);

  const kpis = {
    activeJobs: activeJobs || 0,
    pendingJobs: pendingJobs || 0,
    totalEmployers: totalEmployers || 0,
    totalCandidates: totalCandidates || 0,
    publishedPosts: publishedPosts || 0,
    jobsThisWeek: jobsThisWeek || 0,
  };

  const pending = ((pendingListings || []) as unknown as {
    id: string;
    title: string;
    employer_id: string;
    posted_at: string;
    employers: { company_name: string } | null;
  }[]).map((l) => ({
    id: l.id,
    title: l.title,
    employer_name: l.employers?.company_name || "Unknown",
    posted_at: l.posted_at,
  }));

  return <AdminDashboardClient kpis={kpis} pendingListings={pending} />;
}
