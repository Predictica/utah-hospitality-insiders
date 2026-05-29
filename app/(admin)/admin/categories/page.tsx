"use client";

import { useState, useEffect } from "react";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  listing_count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddStatus("Adding...");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (res.ok) {
      setNewName("");
      setAddStatus("Added!");
      await fetchCategories();
    } else {
      const data = await res.json();
      setAddStatus(data.error || "Failed");
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setActioning(id);

    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim() }),
    });

    setEditingId(null);
    await fetchCategories();
    setActioning(null);
  }

  async function handleDelete(id: string, listingCount: number) {
    if (listingCount > 0) {
      alert(`Cannot delete: ${listingCount} listings use this category.`);
      return;
    }
    if (!confirm("Delete this category?")) return;
    setActioning(id);

    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await fetchCategories();
    setActioning(null);
  }

  async function moveCategory(id: string, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const a = categories[idx];
    const b = categories[swapIdx];

    await Promise.all([
      fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, sort_order: b.sort_order }),
      }),
      fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, sort_order: a.sort_order }),
      }),
    ]);

    await fetchCategories();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Categories</h1>

      {/* Add Category */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Add Category</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
          />
          <button type="submit" className="bg-[#1F4E79] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#163a5c]">
            Add
          </button>
        </div>
        {addStatus && <p className="text-xs text-gray-500 mt-2">{addStatus}</p>}
      </form>

      {/* Categories List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-8">Order</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Slug</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Listings</th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No categories.</td></tr>
            ) : (
              categories.map((c, idx) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveCategory(c.id, "up")} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">&uarr;</button>
                      <button onClick={() => moveCategory(c.id, "down")} disabled={idx === categories.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">&darr;</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === c.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit(c.id)} className="text-xs text-green-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{c.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-right">{c.listing_count}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditingId(c.id); setEditName(c.name); }}
                        className="text-xs text-[#1F4E79] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.listing_count)}
                        disabled={actioning === c.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
