"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const siteUrl = window.location.origin;
      await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });
      setResent(true);
    } catch {
      // silently fail
    }
    setResending(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#1F4E79]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check Your Email!
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          We sent a verification link to{" "}
          <span className="font-medium text-gray-900">{email}</span>. Click the
          link to activate your account and start posting jobs.
        </p>

        <div className="space-y-3">
          {resent ? (
            <p className="text-green-600 text-sm font-medium">
              Verification email resent!
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#1F4E79] text-sm font-medium hover:underline disabled:opacity-50"
            >
              {resending
                ? "Resending..."
                : "Didn't get the email? Resend verification"}
            </button>
          )}

          <div>
            <Link
              href="/employer/login"
              className="text-sm text-gray-500 hover:text-[#1F4E79]"
            >
              Already verified? Sign in &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
