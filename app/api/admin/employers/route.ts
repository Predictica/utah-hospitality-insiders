import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== "boolean") {
      return Response.json(
        { error: "id and is_active are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("employers")
      .update({ is_active })
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Admin Employers] Error:", error);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
