import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getAdmin();

  const { data: categories, error } = await supabase
    .from("job_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Get listing counts
  const { data: listings } = await supabase
    .from("job_listings")
    .select("category_id")
    .not("category_id", "is", null);

  const counts: Record<string, number> = {};
  if (listings) {
    for (const l of listings as { category_id: string }[]) {
      counts[l.category_id] = (counts[l.category_id] || 0) + 1;
    }
  }

  const result = (categories || []).map((c: { id: string; name: string; slug: string; sort_order: number }) => ({
    ...c,
    listing_count: counts[c.id] || 0,
  }));

  return Response.json({ categories: result });
}

export async function POST(request: NextRequest) {
  const supabase = getAdmin();
  const { name } = await request.json();

  if (!name) return Response.json({ error: "Name required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Get max sort_order
  const { data: maxRow } = await supabase
    .from("job_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = ((maxRow as { sort_order: number }[])?.[0]?.sort_order || 0) + 1;

  const { data, error } = await supabase
    .from("job_categories")
    .insert({ name, slug, sort_order: sortOrder })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = getAdmin();
  const { id, ...updates } = await request.json();
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  if (updates.name) {
    updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const { error } = await supabase.from("job_categories").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = getAdmin();
  const { id } = await request.json();
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  // Check if any listings use this category
  const { count } = await supabase
    .from("job_listings")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count || 0) > 0) {
    return Response.json({ error: `Cannot delete: ${count} listings use this category` }, { status: 400 });
  }

  const { error } = await supabase.from("job_categories").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
