import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/auth";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  // Verify admin session
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdmin(user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      employer_name,
      title,
      category_id,
      job_type,
      location_city,
      location_region,
      pay_min,
      pay_max,
      pay_type,
      description,
      application_method,
      application_url,
      source,
      is_featured,
    } = body;

    if (!title || !description || !location_city || !application_url) {
      return Response.json(
        { error: "Title, description, city, and application URL are required." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const adminSupabase = getAdmin();

    const { data, error } = await adminSupabase
      .from("job_listings")
      .insert({
        employer_id: null,
        employer_name: employer_name || null,
        title,
        category_id: category_id || null,
        job_type: job_type || null,
        location_city,
        location_region: location_region || null,
        pay_min: pay_min ?? null,
        pay_max: pay_max ?? null,
        pay_type: pay_type || null,
        description,
        application_method: application_method || "external_link",
        application_url,
        source: source || "free",
        is_featured: is_featured || false,
        is_active: true,
        status: "active",
        posted_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      } as never)
      .select("id")
      .single();

    if (error) {
      console.error("[Admin Jobs] Insert error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { success: true, listing_id: (data as unknown as { id: string }).id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Admin Jobs] Unexpected error:", err);
    return Response.json(
      { error: "Failed to create job listing." },
      { status: 500 }
    );
  }
}
