import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendJobAlert } from "@/lib/email/alerts";
import { resend } from "@/lib/email/resend";
import { listingPendingEmail, adminNewListingEmail } from "@/lib/email/templates";
import type { JobListing } from "@/lib/types/database";

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
      .select("id, tier, email_verified, company_name, email")
      .eq("auth_user_id", user.id)
      .single();

    const emp = employer as unknown as {
      id: string;
      tier: string;
      email_verified: boolean;
      company_name: string;
      email: string;
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

    // Fetch admin settings for free tier limits
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: settingsRows } = await adminSupabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["free_tier_job_limit_enabled", "free_tier_job_limit", "require_approval_free_listings"]);

    const settings: Record<string, string> = {};
    if (settingsRows) {
      for (const s of settingsRows as { key: string; value: string }[]) {
        settings[s.key] = s.value;
      }
    }

    const isFree = emp.tier === "free";
    const limitEnabled = settings.free_tier_job_limit_enabled === "true";
    const jobLimit = parseInt(settings.free_tier_job_limit || "1") || 1;
    const requireApproval = settings.require_approval_free_listings === "true";

    // Check free tier job limit
    if (isFree && limitEnabled) {
      const { count } = await supabase
        .from("job_listings")
        .select("id", { count: "exact", head: true })
        .eq("employer_id", emp.id)
        .eq("is_active", true);

      if ((count || 0) >= jobLimit) {
        return Response.json(
          { error: `Free accounts are limited to ${jobLimit} active job posting${jobLimit > 1 ? "s" : ""} at a time. Please deactivate your current listing or upgrade your plan.` },
          { status: 403 }
        );
      }
    }

    // Determine status and is_active based on tier + approval settings
    const needsApproval = isFree && requireApproval;
    const listingStatus = needsApproval ? "pending" : "active";
    const listingActive = !needsApproval;

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
        is_active: listingActive,
        status: listingStatus,
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

    const listingId = (listing as unknown as { id: string })?.id;

    // Send notification emails for pending free tier listings
    if (needsApproval && listingId) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://utahhospitalityinsiders.com";
        // Email to employer
        const pendingEmail = listingPendingEmail(emp.company_name, title, emp.company_name);
        await resend.emails.send({
          from: "Utah Hospitality Insiders <onboarding@resend.dev>",
          to: emp.email,
          subject: pendingEmail.subject,
          html: pendingEmail.html,
        });
        // Email to admin
        const adminEmail = adminNewListingEmail(title, emp.company_name, emp.email, `${siteUrl}/admin/jobs`);
        await resend.emails.send({
          from: "Utah Hospitality Insiders <onboarding@resend.dev>",
          to: "info@utahhospitalityinsiders.com",
          subject: adminEmail.subject,
          html: adminEmail.html,
        });
      } catch (emailErr) {
        console.error("[Listings] Notification email error (non-fatal):", emailErr);
      }
    }

    // Sponsored listings trigger immediate alerts to matched candidates
    const source = sourceMap[emp.tier] || "free";
    if (source === "sponsored" && listingId) {
      try {
        const alertListing: JobListing = {
          id: listingId,
          employer_id: emp.id,
          employer_name: null,
          source: "sponsored",
          title,
          description,
          job_type: job_type || null,
          category_id: category_id || null,
          location_city,
          location_region: location_region || null,
          pay_min: pay_min || null,
          pay_max: pay_max || null,
          pay_type: pay_type || null,
          application_method,
          application_url: application_url || null,
          is_featured: true,
          is_active: true,
          status: "active",
          scraped_source_url: null,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        };
        await sendJobAlert(alertListing);
      } catch (alertErr) {
        console.error("[Listings] Alert send error (non-fatal):", alertErr);
      }
    }

    const message = needsApproval
      ? "Your job listing has been submitted for review! Free listings are reviewed by our team before going live — typically within 24 hours."
      : "Your job listing is now live! You can view and manage it from your dashboard.";

    return Response.json(
      { message, id: listingId, status: listingStatus },
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
