import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { first_name, last_name, email } = body;

  if (!first_name || !last_name || !email) {
    return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const candidateData = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email.toLowerCase(),
    phone: body.phone || null,
    sms_opted_in: body.sms_opted_in || false,
    email_opted_in: true,
    preferred_locations: body.preferred_locations || [],
    preferred_categories: body.preferred_categories || [],
    availability: body.availability || [],
    pay_minimum: body.pay_minimum ? Number(body.pay_minimum) : null,
    years_experience: body.years_experience || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", candidateData.email)
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from("candidates")
      .update(candidateData)
      .eq("id", existing[0].id);

    if (error) {
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Your preferences have been updated!" });
  }

  const { error } = await supabase.from("candidates").insert(candidateData);

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // Send welcome email for new signups
  try {
    const candidateName = [body.first_name, body.last_name].filter(Boolean).join(" ") || "there";
    const { subject, html } = welcomeEmail(candidateName, candidateData.email);
    console.log("[Signup] Sending welcome email to:", candidateData.email);
    console.log("[Signup] Subject:", subject);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Utah Hospitality Insiders <onboarding@resend.dev>",
      to: candidateData.email,
      subject,
      html,
    });
    if (emailError) {
      console.error("[Signup] Resend API error:", JSON.stringify(emailError));
    } else {
      console.log("[Signup] Welcome email sent successfully. ID:", emailData?.id);
    }
  } catch (emailErr) {
    console.error("[Signup] Welcome email exception:", emailErr);
  }

  return NextResponse.json({
    success: true,
    message: "You're all set! Welcome to Utah Hospitality Insiders. We'll notify you when matching jobs are posted.",
  });
}
