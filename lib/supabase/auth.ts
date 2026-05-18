import { createClient } from "./server";
import { createClient as createBrowserClient } from "./client";

// Server-side auth helpers

export async function signUpEmployer(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/employer/login?verified=true`,
    },
  });
}

export async function signInEmployer(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutEmployer() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentEmployer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("employers")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return data as unknown as import("@/lib/types/database").Employer & {
    auth_user_id: string;
    email_verified: boolean;
  } | null;
}

// Browser-side auth helpers

export function createAuthClient() {
  return createBrowserClient();
}
