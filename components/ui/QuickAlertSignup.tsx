"use client";

import { useState } from "react";

export default function QuickAlertSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/candidates/quick-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else if (data.exists) {
        setStatus("exists");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "exists") {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
        <p className="text-[#1F4E79] font-medium">
          {status === "success"
            ? "You're in! We'll send you matching job alerts."
            : "You're already signed up for alerts!"}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Want to customize which jobs you hear about?{" "}
          <a
            href={`/candidates?email=${encodeURIComponent(email)}`}
            className="text-[#1F4E79] font-medium hover:underline"
          >
            Set your preferences
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900">
        Get Utah Hospitality Insider Job Alerts
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        Be the first to know when similar jobs are posted. No spam. Unsubscribe anytime. Free.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E79] text-gray-900"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#1F4E79] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70 shrink-0"
        >
          {status === "loading" ? "..." : "Notify Me"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-600 text-sm mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
