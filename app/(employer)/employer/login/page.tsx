"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const redirect = searchParams.get("redirect");
  const reset = searchParams.get("reset");
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          setError(
            "Your email has not been verified. Please check your inbox for the verification link."
          );
        } else if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      router.push(redirect || "/employer/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Employer Sign In
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to manage your job listings.
        </p>

        {verified && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
            Email verified successfully! You can now sign in.
          </div>
        )}

        {reset && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
            Password reset successfully! Sign in with your new password.
          </div>
        )}

        {authError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
            {authError === "missing_code"
              ? "Invalid verification link. Please request a new one."
              : authError === "verification_failed"
              ? "Email verification failed. The link may have expired. Please request a new one."
              : "An error occurred. Please try again."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F4E79] text-white py-3 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <Link
            href="/employer/forgot-password"
            className="text-[#1F4E79] hover:underline"
          >
            Forgot password?
          </Link>
          <p className="text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/employer/register"
              className="text-[#1F4E79] hover:underline font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
