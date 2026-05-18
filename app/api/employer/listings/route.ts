import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get employer record
    const { data: employer } = await supabase
      .from("employers")
      .select("id, tier, email_verified")
      .eq("auth_user_id", user.id)
      .single();

    const emp = employer as unknown as {
      id: string;
      tier: string;
      email_verified: boolean;
    } | null;

    if (!emp) {
      return Response.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    if (!emp.email_verified) {
      return Response.json(
        { error: "Please verify your email before posting jobs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
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
    } = body;

    if (!title || !location_city || !description || !application_method) {
      return Response.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    if (description.length < 100) {
      return Response.json(
        { error: "Job description must be at least 100 characters" },
        { status: 400 }
      );
    }

    // Determine source and featured status based on tier
    const sourceMap: Record<string, string> = {
      free: "free",
      standard: "standard",
      sponsored: "sponsored",
      premium_annual: "sponsored",
    };

    const { data: listing, error: insertError } = await supabase
      .from("job_listings")
      .insert({
        employer_id: emp.id,
        title,
        category_id: category_id || null,
        job_type: job_type || null,
        location_city,
        location_region: location_region || null,
        pay_min: pay_min || null,
        pay_max: pay_max || null,
        pay_type: pay_type || null,
        description,
        application_method,
        application_url: application_url || null,
        source: sourceMap[emp.tier] || "free",
        is_featured: emp.tier === "sponsored" || emp.tier === "premium_annual",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      } as never)
      .select("id")
      .single();

    if (insertError) {
      console.error("[Listings] Insert error:", insertError.message);
      return Response.json(
        { error: "Failed to create listing" },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Job posted successfully", id: (listing as unknown as { id: string })?.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Listings] Unexpected error:", error);
    return Response.json(
      { error: "Failed to post job" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
      return Response.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ error: "Listing ID required" }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("job_listings")
      .select("employer_id")
      .eq("id", id)
      .single();

    const existingListing = existing as unknown as { employer_id: string } | null;

    if (!existingListing || existingListing.employer_id !== emp.id) {
      return Response.json(
        { error: "You can only edit your own listings" },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from("job_listings")
      .update({
        title: updates.title,
        category_id: updates.category_id || null,
        job_type: updates.job_type || null,
        location_city: updates.location_city,
        location_region: updates.location_region || null,
        pay_min: updates.pay_min || null,
        pay_max: updates.pay_max || null,
        pay_type: updates.pay_type || null,
        description: updates.description,
        application_method: updates.application_method,
        application_url: updates.application_url || null,
      } as never)
      .eq("id", id);

    if (updateError) {
      console.error("[Listings] Update error:", updateError.message);
      return Response.json(
        { error: "Failed to update listing" },
        { status: 500 }
      );
    }

    return Response.json({ message: "Listing updated successfully" });
  } catch (error) {
    console.error("[Listings] Unexpected error:", error);
    return Response.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
