"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SearchBarInner({
  defaultValue = "",
  preserveParams = true,
}: {
  defaultValue?: string;
  preserveParams?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const searchParams = preserveParams ? useSearchParams() : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = searchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs by title, company, or keyword..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79] focus:border-transparent text-gray-900"
      />
      <button
        type="submit"
        className="bg-[#1F4E79] text-white px-6 py-3 rounded-r-lg hover:bg-[#163a5c] transition-colors font-medium"
      >
        Search
      </button>
    </form>
  );
}

export default function SearchBar({
  defaultValue = "",
  preserveParams = true,
}: {
  defaultValue?: string;
  preserveParams?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full">
          <input
            type="text"
            defaultValue={defaultValue}
            placeholder="Search jobs by title, company, or keyword..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg text-gray-900"
            disabled
          />
          <button className="bg-[#1F4E79] text-white px-6 py-3 rounded-r-lg font-medium" disabled>
            Search
          </button>
        </div>
      }
    >
      <SearchBarInner defaultValue={defaultValue} preserveParams={preserveParams} />
    </Suspense>
  );
}
