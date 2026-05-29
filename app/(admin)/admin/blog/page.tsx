"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, []);

  async function togglePublish(id: string, current: boolean) {
    setActioning(id);
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_published: !current }),
    });
    await fetchPosts();
    setActioning(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post?")) return;
    setActioning(id);
    await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchPosts();
    setActioning(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="bg-[#1F4E79] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#163a5c] transition-colors"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Category</th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Published</th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No blog posts yet.</td></tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3 text-gray-500">{post.category}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${post.is_published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-xs text-[#1F4E79] font-medium hover:underline">Edit</Link>
                      <button onClick={() => togglePublish(post.id, post.is_published)} disabled={actioning === post.id} className="text-xs text-gray-500 hover:underline disabled:opacity-50">
                        {post.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => handleDelete(post.id)} disabled={actioning === post.id} className="text-xs text-red-600 hover:underline disabled:opacity-50">Delete</button>
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
