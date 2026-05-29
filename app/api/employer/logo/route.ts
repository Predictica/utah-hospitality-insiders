import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    const emp = employer as unknown as { id: string } | null;
    if (!emp) {
      return Response.json({ error: "Employer not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return Response.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const fileName = `${emp.id}-${Date.now()}.${ext}`;

    // Use admin client for storage upload
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminSupabase.storage
      .from("employer-logos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Logo] Upload error:", uploadError.message);
      return Response.json({ error: "Failed to upload logo" }, { status: 500 });
    }

    const { data: publicUrl } = adminSupabase.storage
      .from("employer-logos")
      .getPublicUrl(fileName);

    // Update employer record
    await adminSupabase
      .from("employers")
      .update({ logo_url: publicUrl.publicUrl })
      .eq("id", emp.id);

    return Response.json({ logo_url: publicUrl.publicUrl });
  } catch (error) {
    console.error("[Logo] Unexpected error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
