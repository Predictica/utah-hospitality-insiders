"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const REGIONS = [
  "Salt Lake City",
  "Park City",
  "Provo / Orem",
  "Ogden",
  "Logan",
  "Brigham City",
  "St. George",
  "Cedar City",
  "Moab",
];

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "seasonal", label: "Seasonal" },
  { value: "gig", label: "Gig" },
];

const PAY_TYPES = [
  { value: "hourly", label: "Hourly" },
  { value: "salary", label: "Salary" },
  { value: "tips_plus", label: "Tips Plus" },
];

interface PostJobFormProps {
  categories: { id: string; name: string }[];
  initialData?: {
    id: string;
    title: string;
    category_id: string | null;
    job_type: string | null;
    location_city: string | null;
    location_region: string | null;
    pay_min: number | null;
    pay_max: number | null;
    pay_type: string | null;
    description: string | null;
    application_method: string | null;
    application_url: string | null;
  };
}

export default function PostJobForm({
  categories,
  initialData,
}: PostJobFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title || "",
    category_id: initialData?.category_id || "",
    job_type: initialData?.job_type || "",
    location_city: initialData?.location_city || "",
    location_region: initialData?.location_region || "",
    pay_min: initialData?.pay_min?.toString() || "",
    pay_max: initialData?.pay_max?.toString() || "",
    pay_type: initialData?.pay_type || "",
    description: initialData?.description || "",
    application_method: initialData?.application_method || "external_link",
    application_url: initialData?.application_url || "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title || !form.location_city || !form.description) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.description.length < 100) {
      setError("Job description must be at least 100 characters");
      return;
    }
    if (!form.application_url) {
      setError(
        form.application_method === "email"
          ? "Please enter an application email"
          : "Please enter an application URL"
      );
      return;
    }

    setLoading(true);
    try {
      const body = {
        ...(isEdit ? { id: initialData!.id } : {}),
        title: form.title,
        category_id: form.category_id || null,
        job_type: form.job_type || null,
        location_city: form.location_city,
        location_region: form.location_region || null,
        pay_min: form.pay_min ? parseFloat(form.pay_min) : null,
        pay_max: form.pay_max ? parseFloat(form.pay_max) : null,
        pay_type: form.pay_type || null,
        description: form.description,
        application_method: form.application_method,
        application_url: form.application_url,
      };

      const res = await fetch("/api/employer/listings", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        if (isEdit) {
          router.push("/employer/dashboard");
          router.refresh();
        } else {
          setSuccessMessage(data.message || "Job posted successfully!");
        }
      } else {
        setError(data.error || "Failed to save listing");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (successMessage) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Listing Submitted!</h2>
        <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">{successMessage}</p>
        <Link
          href="/employer/dashboard"
          className="inline-block bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Front Desk Agent"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              value={form.job_type}
              onChange={(e) => update("job_type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            >
              <option value="">Select type...</option>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location City *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utah Region
            </label>
            <select
              value={form.location_region}
              onChange={(e) => update("location_region", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            >
              <option value="">Select region...</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Minimum
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.pay_min}
              onChange={(e) => update("pay_min", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Maximum
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.pay_max}
              onChange={(e) => update("pay_max", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Type
            </label>
            <select
              value={form.pay_type}
              onChange={(e) => update("pay_type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            >
              <option value="">Select type...</option>
              {PAY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description * (min 100 characters)
          </label>
          <textarea
            required
            minLength={100}
            rows={8}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the role, responsibilities, qualifications, and benefits..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
          />
          <p className="text-xs text-gray-400 mt-1">
            {form.description.length} characters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Method *
            </label>
            <select
              value={form.application_method}
              onChange={(e) => update("application_method", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            >
              <option value="external_link">External Link</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.application_method === "email"
                ? "Application Email *"
                : "Application URL *"}
            </label>
            <input
              type={form.application_method === "email" ? "email" : "url"}
              required
              value={form.application_url}
              onChange={(e) => update("application_url", e.target.value)}
              placeholder={
                form.application_method === "email"
                  ? "careers@company.com"
                  : "https://company.com/apply"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Your listing will be live for 30 days from posting.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1F4E79] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70"
        >
          {loading
            ? "Saving..."
            : isEdit
            ? "Update Listing"
            : "Post Job"}
        </button>
        <Link
          href="/employer/dashboard"
          className="px-6 py-3 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
