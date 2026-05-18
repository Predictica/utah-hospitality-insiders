"use client";

import { useState } from "react";

interface EmployerRow {
  id: string;
  company_name: string;
  email: string;
  tier: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  listing_count: number;
}

export default function EmployersClient({
  employers: initialEmployers,
}: {
  employers: EmployerRow[];
}) {
  const [employers, setEmployers] = useState(initialEmployers);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleActive(id: string, currentlyActive: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch("/api/admin/employers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentlyActive }),
      });
      if (res.ok) {
        setEmployers((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, is_active: !currentlyActive } : e
          )
        );
      }
    } catch {
      // silently fail
    }
    setTogglingId(null);
  }

  const tierLabels: Record<string, string> = {
    free: "Free",
    standard: "Standard",
    sponsored: "Sponsored",
    premium_annual: "Premium",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">
                Company
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">
                Email
              </th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">
                Tier
              </th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">
                Verified
              </th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">
                Active
              </th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">
                Listings
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">
                Registered
              </th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No employers registered yet.
                </td>
              </tr>
            ) : (
              employers.map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {e.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium bg-blue-50 text-[#1F4E79] px-2 py-0.5 rounded">
                      {tierLabels[e.tier] || e.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {e.email_verified ? (
                      <span className="text-green-600 text-xs">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {e.is_active ? (
                      <span className="text-green-600 text-xs">Yes</span>
                    ) : (
                      <span className="text-red-500 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{e.listing_count}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(e.id, e.is_active)}
                      disabled={togglingId === e.id}
                      className={`text-xs font-medium disabled:opacity-50 ${
                        e.is_active
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {togglingId === e.id
                        ? "..."
                        : e.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
