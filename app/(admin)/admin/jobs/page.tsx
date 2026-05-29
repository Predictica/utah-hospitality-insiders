"use client";

import { useState, useEffect, useCallback } from "react";

interface Listing {
  id: string;
  title: string;
  location_city: string | null;
  source: string;
  status: string | null;
  is_active: boolean;
  is_featured: boolean;
  posted_at: string;
  expires_at: string;
  employers: { company_name: string } | null;
  employer_name: string | null;
}

export default function AdminJobsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (search) params.set("search", search);
    params.set("page", page.toString());

    const res = await fetch(`/api/admin/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [statusFilter, sourceFilter, search, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  async function handleAction(id: string, updates: Record<string, unknown>) {
    setActioning(id);
    await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    await fetchListings();
    setActioning(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing permanently?")) return;
    setActioning(id);
    await fetch("/api/admin/listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchListings();
    setActioning(null);
  }

  async function bulkAction(action: "approve" | "reject" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} listings?`)) return;

    for (const id of selected) {
      if (action === "delete") {
        await fetch("/api/admin/listings", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } else {
        await fetch("/api/admin/listings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: action === "approve" ? "active" : "rejected",
            is_active: action === "approve",
          }),
        });
      }
    }
    setSelected(new Set());
    await fetchListings();
  }

  const totalPages = Math.ceil(total / 20);

  const statusColors: Record<string, string> = {
    active: "text-green-700 bg-green-50",
    pending: "text-amber-700 bg-amber-50",
    rejected: "text-red-700 bg-red-50",
    expired: "text-gray-500 bg-gray-100",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Jobs Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search titles..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79] w-48"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
        >
          <option value="">All sources</option>
          <option value="free">Free</option>
          <option value="standard">Standard</option>
          <option value="sponsored">Sponsored</option>
          <option value="scraped">Scraped</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-blue-50 p-3 rounded-lg">
          <span className="text-sm text-gray-700">{selected.size} selected</span>
          <button onClick={() => bulkAction("approve")} className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded hover:bg-green-200">Approve</button>
          <button onClick={() => bulkAction("reject")} className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded hover:bg-amber-200">Reject</button>
          <button onClick={() => bulkAction("delete")} className="text-xs font-medium text-red-700 bg-red-100 px-3 py-1 rounded hover:bg-red-200">Delete</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 ml-auto">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left w-8">
                  <input
                    type="checkbox"
                    checked={listings.length > 0 && selected.size === listings.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(listings.map((l) => l.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-gray-600 font-medium">Title</th>
                <th className="px-3 py-2 text-left text-gray-600 font-medium">Employer</th>
                <th className="px-3 py-2 text-left text-gray-600 font-medium">Source</th>
                <th className="px-3 py-2 text-center text-gray-600 font-medium">Status</th>
                <th className="px-3 py-2 text-left text-gray-600 font-medium">Posted</th>
                <th className="px-3 py-2 text-center text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">No listings found.</td></tr>
              ) : (
                listings.map((l) => (
                  <tr key={l.id} className={`border-t border-gray-100 ${l.status === "pending" ? "bg-amber-50/50" : ""}`}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(l.id); else next.delete(l.id);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900 max-w-[200px] truncate">{l.title}</td>
                    <td className="px-3 py-2 text-gray-500 max-w-[150px] truncate">{l.employers?.company_name || l.employer_name || "—"}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{l.source}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[l.status || "active"] || "text-gray-500 bg-gray-100"}`}>
                        {l.status || "active"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(l.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {l.status === "pending" && (
                          <button onClick={() => handleAction(l.id, { status: "active", is_active: true })} disabled={actioning === l.id} className="text-xs text-green-700 hover:underline disabled:opacity-50">Approve</button>
                        )}
                        {l.status === "pending" && (
                          <button onClick={() => handleAction(l.id, { status: "rejected", is_active: false })} disabled={actioning === l.id} className="text-xs text-amber-700 hover:underline disabled:opacity-50">Reject</button>
                        )}
                        <button onClick={() => handleAction(l.id, { is_featured: !l.is_featured })} disabled={actioning === l.id} className="text-xs text-[#1F4E79] hover:underline disabled:opacity-50">
                          {l.is_featured ? "Unfeature" : "Feature"}
                        </button>
                        {l.is_active && l.status !== "pending" && (
                          <button onClick={() => handleAction(l.id, { is_active: false })} disabled={actioning === l.id} className="text-xs text-gray-500 hover:underline disabled:opacity-50">Deactivate</button>
                        )}
                        <button onClick={() => handleDelete(l.id)} disabled={actioning === l.id} className="text-xs text-red-600 hover:underline disabled:opacity-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
