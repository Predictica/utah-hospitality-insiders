import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Check if email matches admin
export function isAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

// Server-side check — redirects to home if not admin
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdmin(user.email)) {
    redirect("/");
  }

  return { email: user.email };
}
