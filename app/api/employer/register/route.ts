import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_name,
      contact_name,
      email,
      password,
      phone,
      website,
      number_of_locations,
      number_of_employees,
      tier,
      is_small_business,
    } = body;

    if (!company_name || !contact_name || !email || !password || !phone) {
      return Response.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Use the server client for auth signup (uses anon key, respects auth flow)
    const supabase = await createServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://utahhospitalityinsiders.com";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (authError) {
      console.error("[Register] Auth error:", authError.message);
      return Response.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return Response.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Use service role to create employer record (bypasses RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: employerError } = await adminSupabase
      .from("employers")
      .insert({
        auth_user_id: authData.user.id,
        company_name,
        contact_name,
        email,
        phone,
        website: website || null,
        number_of_locations: number_of_locations || null,
        number_of_employees: number_of_employees || null,
        tier: tier || "free",
        is_small_business: is_small_business || false,
        is_active: true,
        email_verified: false,
      });

    if (employerError) {
      console.error("[Register] Employer insert error:", employerError.message);
      // Clean up the auth user if employer creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return Response.json(
        { error: "Failed to create employer profile. Please try again." },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Account created. Check your email to verify.", email },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Unexpected error:", error);
    return Response.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
