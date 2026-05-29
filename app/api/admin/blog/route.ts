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
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = getAdmin();
  const body = await request.json();

  const slug = body.slug || body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content,
      author: body.author || "Utah Hospitality Insiders",
      category: body.category || "Industry News",
      featured_image: body.featured_image || null,
      is_published: body.is_published || false,
      published_at: body.is_published ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ id: (data as { id: string }).id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = getAdmin();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  // If publishing for the first time, set published_at
  if (updates.is_published && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase.from("blog_posts").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = getAdmin();
  const { id } = await request.json();
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
