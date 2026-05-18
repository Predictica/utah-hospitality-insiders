import { createClient } from "@supabase/supabase-js";
import ScrapeClient from "./ScrapeClient";

export const metadata = {
  title: "Scraper Admin — Utah Hospitality Insiders",
};

export const dynamic = "force-dynamic";

export default async function ScrapeAdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: targets } = await supabase
    .from("scrape_targets")
    .select("*")
    .order("employer_name");

  return <ScrapeClient targets={targets || []} />;
}
