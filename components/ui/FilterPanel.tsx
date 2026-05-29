"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import type { JobCategory } from "@/lib/types/database";

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "seasonal", label: "Seasonal" },
  { value: "gig", label: "Gig" },
];

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
  "Statewide",
];

function FilterPanelInner({ categories }: { categories: JobCategory[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const hasFilters =
    searchParams.has("category") ||
    searchParams.has("job_type") ||
    searchParams.has("region") ||
    searchParams.has("pay_min");

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/jobs?${params.toString()}`);
  }

  const filterContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Category
        </label>
        <select
          value={searchParams.get("category") || ""}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Job Type
        </label>
        <select
          value={searchParams.get("job_type") || ""}
          onChange={(e) => updateFilter("job_type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
        >
          <option value="">All Job Types</option>
          {JOB_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Region
        </label>
        <select
          value={searchParams.get("region") || ""}
          onChange={(e) => updateFilter("region", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
        >
          <option value="">All Regions</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Minimum Pay
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            value={searchParams.get("pay_min") || ""}
            onChange={(e) => updateFilter("pay_min", e.target.value)}
            placeholder="e.g. 15"
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-[#1F4E79] hover:text-[#163a5c] font-medium py-2 border border-[#1F4E79] rounded-lg hover:bg-blue-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{filterContent}</div>

      {/* Mobile collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-medium text-[#1F4E79] mb-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {open ? "Hide Filters" : "Show Filters"}
          {hasFilters && (
            <span className="bg-[#1F4E79] text-white text-xs px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>
        {open && <div className="mb-4">{filterContent}</div>}
      </div>
    </>
  );
}

export default function FilterPanel({ categories }: { categories: JobCategory[] }) {
  return (
    <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 rounded-lg" />}>
      <FilterPanelInner categories={categories} />
    </Suspense>
  );
}
