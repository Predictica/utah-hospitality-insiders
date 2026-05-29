"use client";

import { useState } from "react";
import Link from "next/link";

interface KPIs {
  activeJobs: number;
  pendingJobs: number;
  totalEmployers: number;
  totalCandidates: number;
  publishedPosts: number;
  jobsThisWeek: number;
}

interface PendingListing {
  id: string;
  title: string;
  employer_name: string;
  posted_at: string;
}

export default function AdminDashboardClient({
  kpis,
  pendingListings: initialPending,
}: {
  kpis: KPIs;
  pendingListings: PendingListing[];
}) {
  const [pending, setPending] = useState(initialPending);
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActioning(id);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: action === "approve" ? "active" : "rejected",
          is_active: action === "approve",
        }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      // silently fail
    }
    setActioning(null);
  }

  const cards = [
    { label: "Active Jobs", value: kpis.activeJobs, color: "text-green-700", bg: "bg-green-50" },
    { label: "Pending Approval", value: kpis.pendingJobs, color: "text-amber-700", bg: "bg-amber-50", badge: kpis.pendingJobs > 0 },
    { label: "Employers", value: kpis.totalEmployers, color: "text-[#1F4E79]", bg: "bg-blue-50" },
    { label: "Candidates", value: kpis.totalCandidates, color: "text-purple-700", bg: "bg-purple-50" },
    { label: "Blog Posts", value: kpis.publishedPosts, color: "text-gray-700", bg: "bg-gray-50" },
    { label: "Jobs This Week", value: kpis.jobsThisWeek, color: "text-[#1F4E79]", bg: "bg-blue-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-lg p-4 text-center relative`}>
            {card.badge && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approval Queue */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Pending Approval</h2>
          <Link href="/admin/jobs" className="text-xs text-[#1F4E79] font-medium hover:underline">
            View all jobs &rarr;
          </Link>
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            No listings pending approval.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.employer_name} &middot; {new Date(item.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(item.id, "approve")}
                    disabled={actioning === item.id}
                    className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "reject")}
                    disabled={actioning === item.id}
                    className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
