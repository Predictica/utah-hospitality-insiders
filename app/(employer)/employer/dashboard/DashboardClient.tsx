"use client";

import { useState } from "react";
import Link from "next/link";

interface DashboardListing {
  id: string;
  title: string;
  location_city: string | null;
  posted_at: string;
  expires_at: string;
  is_active: boolean;
  view_count: number;
  click_count: number;
}

export default function DashboardClient({
  listings: initialListings,
}: {
  listings: DashboardListing[];
}) {
  const [listings, setListings] = useState(initialListings);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleActive(id: string, currentlyActive: boolean) {
    setTogglingId(id);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await (supabase
        .from("job_listings") as ReturnType<typeof supabase.from>)
        .update({ is_active: !currentlyActive } as never)
        .eq("id", id);

      if (!error) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, is_active: !currentlyActive } : l
          )
        );
      }
    } catch {
      // silently fail
    }
    setTogglingId(null);
  }

  function getStatus(listing: DashboardListing): {
    label: string;
    color: string;
  } {
    if (!listing.is_active) return { label: "Inactive", color: "text-gray-400" };
    if (new Date(listing.expires_at) < new Date())
      return { label: "Expired", color: "text-red-600" };
    return { label: "Active", color: "text-green-600" };
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">
                Job Title
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">
                Location
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">
                Posted
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">
                Expires
              </th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">
                Views
              </th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">
                Clicks
              </th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">
                Status
              </th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const status = getStatus(listing);
              return (
                <tr key={listing.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {listing.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {listing.location_city || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                    {new Date(listing.posted_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                    {new Date(listing.expires_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">{listing.view_count}</td>
                  <td className="px-4 py-3 text-right">
                    {listing.click_count}
                  </td>
                  <td className={`px-4 py-3 text-center text-xs font-medium ${status.color}`}>
                    {status.label}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/employer/listings/${listing.id}/edit`}
                        className="text-[#1F4E79] text-xs font-medium hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          toggleActive(listing.id, listing.is_active)
                        }
                        disabled={togglingId === listing.id}
                        className="text-xs font-medium disabled:opacity-50 text-gray-500 hover:text-red-600"
                      >
                        {togglingId === listing.id
                          ? "..."
                          : listing.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
