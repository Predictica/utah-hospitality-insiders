import { createClient } from "@supabase/supabase-js";
import CandidatesClient from "./CandidatesClient";

export const metadata = { title: "Candidates Admin — Utah Hospitality Insiders" };
export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, count } = await supabase
    .from("candidates")
    .select("id, first_name, last_name, email, email_opted_in, is_active, preferred_categories, preferred_locations, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  const candidates = (data || []) as {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    email_opted_in: boolean;
    is_active: boolean;
    preferred_categories: string[];
    preferred_locations: string[];
    created_at: string;
  }[];

  return <CandidatesClient candidates={candidates} total={count || 0} />;
}
