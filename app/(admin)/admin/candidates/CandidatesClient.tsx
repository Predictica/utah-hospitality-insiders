"use client";

import { useState } from "react";

interface CandidateRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_opted_in: boolean;
  is_active: boolean;
  preferred_categories: string[];
  preferred_locations: string[];
  created_at: string;
}

export default function CandidatesClient({
  candidates: initial,
  total,
}: {
  candidates: CandidateRow[];
  total: number;
}) {
  const [candidates, setCandidates] = useState(initial);
  const [search, setSearch] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const filtered = search
    ? candidates.filter(
        (c) =>
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
      )
    : candidates;

  async function handleDeactivate(id: string) {
    setActioning(id);
    const res = await fetch("/api/admin/candidates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: false, email_opted_in: false }),
    });
    if (res.ok) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: false, email_opted_in: false } : c))
      );
    }
    setActioning(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this candidate permanently?")) return;
    setActioning(id);
    const res = await fetch("/api/admin/candidates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    }
    setActioning(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500">{total} total candidates</p>
        </div>
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-56 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Prefs Set</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Active</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Signed Up</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No candidates found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}`.trim() : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-center text-xs">
                      {(c.preferred_categories?.length > 0 || c.preferred_locations?.length > 0) ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {c.is_active ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {c.is_active && (
                          <button onClick={() => handleDeactivate(c.id)} disabled={actioning === c.id} className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-50">Deactivate</button>
                        )}
                        <button onClick={() => handleDelete(c.id)} disabled={actioning === c.id} className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
