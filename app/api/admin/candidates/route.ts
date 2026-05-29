import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(request: NextRequest) {
  const supabase = getAdmin();
  const { id, ...updates } = await request.json();
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  const { error } = await supabase.from("candidates").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = getAdmin();
  const { id } = await request.json();
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  const { error } = await supabase.from("candidates").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
