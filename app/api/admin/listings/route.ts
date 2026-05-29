import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabase = getAdmin();
  const url = new URL(request.url);

  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("job_listings")
    .select("*, employers(company_name)", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, count, error } = await query
    .order("posted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ listings: data || [], total: count || 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  const supabase = getAdmin();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return Response.json({ error: "ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("job_listings")
    .update(updates)
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = getAdmin();
  const { id } = await request.json();

  if (!id) {
    return Response.json({ error: "ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("job_listings").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
