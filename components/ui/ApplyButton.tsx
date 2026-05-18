"use client";

import { useState } from "react";

export default function ApplyButton({
  listingId,
  applicationUrl,
  label = "Apply Now",
  note,
}: {
  listingId: string;
  applicationUrl: string;
  label?: string;
  note?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/track/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
    } catch {
      // tracking failure shouldn't block the redirect
    }
    window.open(applicationUrl, "_blank", "noopener,noreferrer");
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1F4E79] text-white px-8 py-3 rounded-lg hover:bg-[#163a5c] transition-colors font-medium disabled:opacity-70"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting...
          </>
        ) : (
          label
        )}
      </button>
      {note && (
        <p className="text-xs text-gray-500 mt-2">{note}</p>
      )}
    </div>
  );
}
