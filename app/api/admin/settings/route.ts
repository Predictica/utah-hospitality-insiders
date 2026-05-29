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
    .from("admin_settings")
    .select("*")
    .order("key");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ settings: data || [] });
}

export async function PUT(request: NextRequest) {
  const supabase = getAdmin();
  const { settings } = await request.json();

  if (!Array.isArray(settings)) {
    return Response.json({ error: "settings array required" }, { status: 400 });
  }

  for (const s of settings as { key: string; value: string }[]) {
    await supabase
      .from("admin_settings")
      .update({ value: s.value, updated_at: new Date().toISOString() })
      .eq("key", s.key);
  }

  return Response.json({ success: true });
}
