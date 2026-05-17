"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { JobCategory } from "@/lib/types/database";

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "seasonal", label: "Seasonal" },
  { value: "gig", label: "Gig" },
];

const LOCATIONS = [
  "Salt Lake City",
  "Park City",
  "Provo",
  "Ogden",
  "St. George",
  "Moab",
];

export default function FilterPanel({ categories }: { categories: JobCategory[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={searchParams.get("category") || ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("type") || ""}
        onChange={(e) => updateFilter("type", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
      >
        <option value="">All Job Types</option>
        {JOB_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("location") || ""}
        onChange={(e) => updateFilter("location", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
      >
        <option value="">All Locations</option>
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
    </div>
  );
}
