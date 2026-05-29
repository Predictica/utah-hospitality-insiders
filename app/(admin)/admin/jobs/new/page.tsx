"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "seasonal", label: "Seasonal" },
  { value: "gig", label: "Gig" },
];

const REGIONS = [
  "Salt Lake City",
  "Park City",
  "Provo/Orem",
  "Ogden",
  "St. George",
  "Moab",
  "Statewide",
];

const PAY_TYPES = [
  { value: "hourly", label: "Hourly" },
  { value: "salary", label: "Salary" },
  { value: "tips_plus", label: "Tips Plus" },
];

const SOURCES = ["free", "standard", "sponsored", "scraped"] as const;

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function AdminNewJobPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    employer_name: "",
    title: "",
    category_id: "",
    job_type: "full_time",
    location_city: "",
    location_region: "Salt Lake City",
    pay_min: "",
    pay_max: "",
    pay_type: "hourly",
    description: "",
    application_method: "external_link" as "external_link" | "email",
    application_url: "",
    source: "free" as typeof SOURCES[number],
    is_featured: false,
    expires_at: defaultExpiresAt(),
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        const cats = d.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          setForm((prev) => ({ ...prev, category_id: cats[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.location_city || !form.application_url) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employer_name: form.employer_name || null,
          title: form.title,
          category_id: form.category_id || null,
          job_type: form.job_type,
          location_city: form.location_city,
          location_region: form.location_region,
          pay_min: form.pay_min ? Number(form.pay_min) : null,
          pay_max: form.pay_max ? Number(form.pay_max) : null,
          pay_type: form.pay_type,
          description: form.description,
          application_method: form.application_method,
          application_url: form.application_url,
          source: form.source,
          is_featured: form.is_featured,
          expires_at: form.expires_at,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post job");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSaving(false);
  }

  function handleReset() {
    setSuccess(false);
    setError("");
    setForm({
      employer_name: "",
      title: "",
      category_id: categories[0]?.id || "",
      job_type: "full_time",
      location_city: "",
      location_region: "Salt Lake City",
      pay_min: "",
      pay_max: "",
      pay_type: "hourly",
      description: "",
      application_method: "external_link",
      application_url: "",
      source: "free",
      is_featured: false,
      expires_at: defaultExpiresAt(),
    });
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job posted successfully!</h2>
        <p className="text-gray-500 mb-8">The listing is now live on the public jobs page.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors"
          >
            Post Another Job
          </button>
          <Link
            href="/admin/jobs"
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View All Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-sm text-gray-500 mt-1">Quick-add a listing on behalf of any employer.</p>
        </div>
        <Link
          href="/admin/jobs"
          className="text-sm text-[#1F4E79] font-medium hover:underline"
        >
          &larr; All Jobs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Employer & Role</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
            <input
              type="text"
              value={form.employer_name}
              onChange={(e) => update("employer_name", e.target.value)}
              placeholder="e.g. Grand America Hotel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Line Cook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={form.job_type}
                onChange={(e) => update("job_type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Location</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={form.location_city}
                onChange={(e) => update("location_city", e.target.value)}
                placeholder="e.g. Salt Lake City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utah Region</label>
              <select
                value={form.location_region}
                onChange={(e) => update("location_region", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Compensation</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Min</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pay_min}
                onChange={(e) => update("pay_min", e.target.value)}
                placeholder="e.g. 18"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Max</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pay_max}
                onChange={(e) => update("pay_max", e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
              <select
                value={form.pay_type}
                onChange={(e) => update("pay_type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                {PAY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea
              required
              rows={10}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the role, responsibilities, requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Method</label>
              <select
                value={form.application_method}
                onChange={(e) => update("application_method", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                <option value="external_link">External Link</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.application_method === "email" ? "Email Address" : "Application URL"} *
              </label>
              <input
                type={form.application_method === "email" ? "email" : "url"}
                required
                value={form.application_url}
                onChange={(e) => update("application_url", e.target.value)}
                placeholder={form.application_method === "email" ? "hr@company.com" : "https://careers.company.com/apply"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Admin Options</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => update("expires_at", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => update("is_featured", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                />
                <span className="text-sm font-medium text-gray-700">Featured listing</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1F4E79] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70"
          >
            {saving ? "Posting..." : "Post Job"}
          </button>
          <Link
            href="/admin/jobs"
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
