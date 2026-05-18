import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("x-scrape-token");
  const expectedToken = process.env.SCRAPE_SECRET_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("scrape_targets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Targets API] Delete error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Targets API] Unexpected error:", error);
    return Response.json({ error: "Failed to delete target" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-scrape-token");
  const expectedToken = process.env.SCRAPE_SECRET_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { employer_name, careers_page_url } = body;

    if (!employer_name || !careers_page_url) {
      return Response.json(
        { error: "employer_name and careers_page_url are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("scrape_targets")
      .insert({
        employer_name,
        careers_page_url,
        is_active: true,
        scrape_frequency_hours: 24,
      })
      .select()
      .single();

    if (error) {
      console.error("[Targets API] Insert error:", error.message);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("[Targets API] Unexpected error:", error);
    return Response.json(
      { error: "Failed to add target" },
      { status: 500 }
    );
  }
}
