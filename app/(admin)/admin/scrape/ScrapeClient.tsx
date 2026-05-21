"use client";

import { useState } from "react";

interface ScrapeTarget {
  id: string;
  employer_name: string;
  careers_page_url: string;
  is_active: boolean;
  last_scraped_at: string | null;
  scrape_frequency_hours: number;
  notes: string | null;
}

interface ScrapeResult {
  targetsChecked: number;
  targetsScraped: number;
  jobsFound: number;
  jobsInserted: number;
  errors: string[];
  details: { employer: string; found: number; inserted: number; error?: string }[];
}

const SCRAPE_TOKEN = "utah-hospitality-insiders-scrape-2026";

export default function ScrapeClient({ targets: initialTargets }: { targets: ScrapeTarget[] }) {
  const [targets, setTargets] = useState<ScrapeTarget[]>(initialTargets);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Digest state
  const [sendingDigest, setSendingDigest] = useState(false);
  const [digestResult, setDigestResult] = useState<{ sent: number } | null>(null);
  const [digestError, setDigestError] = useState("");

  // Add target form
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addStatus, setAddStatus] = useState("");

  async function runScraper() {
    setRunning(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/scrape", {
        headers: { "x-scrape-token": SCRAPE_TOKEN },
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Scrape failed");
      }
    } catch {
      setError("Network error — could not reach scrape endpoint.");
    }

    setRunning(false);
  }

  async function runDigest() {
    setSendingDigest(true);
    setDigestResult(null);
    setDigestError("");

    try {
      const res = await fetch("/api/alerts/digest", {
        headers: { "x-scrape-token": SCRAPE_TOKEN },
      });
      const data = await res.json();

      if (res.ok) {
        setDigestResult({ sent: data.sent });
      } else {
        setDigestError(data.error || "Failed to send digest");
      }
    } catch {
      setDigestError("Network error — could not reach digest endpoint.");
    }

    setSendingDigest(false);
  }

  async function addTarget(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    setAddStatus("Adding...");
    try {
      const res = await fetch("/api/scrape/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-scrape-token": SCRAPE_TOKEN,
        },
        body: JSON.stringify({
          employer_name: newName.trim(),
          careers_page_url: newUrl.trim(),
        }),
      });
      if (res.ok) {
        const newTarget = await res.json();
        setTargets((prev) => [...prev, newTarget]);
        setAddStatus("Added!");
        setNewName("");
        setNewUrl("");
      } else {
        const data = await res.json();
        setAddStatus(data.error || "Failed to add.");
      }
    } catch {
      setAddStatus("Network error.");
    }
  }

  async function deleteTarget(id: string) {
    if (!confirm("Are you sure you want to delete this target?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/scrape/targets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-scrape-token": SCRAPE_TOKEN,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setTargets((prev) => prev.filter((t) => t.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete.");
      }
    } catch {
      alert("Network error.");
    }
    setDeletingId(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Scraper Admin</h1>
        <a href="/admin/employers" className="text-[#1F4E79] text-sm font-medium hover:underline">
          Employer Admin &rarr;
        </a>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Manage scrape targets and trigger manual scrape runs.
      </p>

      {/* Run Scraper */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Run Scraper</h2>
        <button
          onClick={runScraper}
          disabled={running}
          className="bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {running ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scraping...
            </>
          ) : (
            "Run Scraper Now"
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{result.targetsChecked}</p>
                <p className="text-xs text-gray-500">Targets Checked</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{result.targetsScraped}</p>
                <p className="text-xs text-gray-500">Targets Scraped</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-[#1F4E79]">{result.jobsFound}</p>
                <p className="text-xs text-gray-500">Jobs Found</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{result.jobsInserted}</p>
                <p className="text-xs text-gray-500">Jobs Inserted</p>
              </div>
            </div>

            {result.details.length > 0 && (
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-600">Employer</th>
                    <th className="text-right px-3 py-2 text-gray-600">Found</th>
                    <th className="text-right px-3 py-2 text-gray-600">Inserted</th>
                    <th className="text-left px-3 py-2 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.map((d, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2">{d.employer}</td>
                      <td className="px-3 py-2 text-right">{d.found}</td>
                      <td className="px-3 py-2 text-right">{d.inserted}</td>
                      <td className="px-3 py-2">
                        {d.error ? (
                          <span className="text-red-600 text-xs">{d.error}</span>
                        ) : (
                          <span className="text-green-600 text-xs">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {result.errors.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-medium text-red-700 text-sm mb-1">Errors:</p>
                <ul className="text-red-600 text-xs space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily Digest */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Email Alerts</h2>
        <button
          onClick={runDigest}
          disabled={sendingDigest}
          className="bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {sendingDigest ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </>
          ) : (
            "Send Daily Digest Now"
          )}
        </button>

        {digestError && (
          <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{digestError}</div>
        )}

        {digestResult && (
          <div className="mt-4 bg-green-50 p-3 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              Digest sent to {digestResult.sent} candidate{digestResult.sent !== 1 ? "s" : ""}.
            </p>
          </div>
        )}
      </div>

      {/* Scrape Targets */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Scrape Targets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 text-gray-600">Employer</th>
                <th className="text-left px-3 py-2 text-gray-600">URL</th>
                <th className="text-left px-3 py-2 text-gray-600">Last Scraped</th>
                <th className="text-center px-3 py-2 text-gray-600">Active</th>
                <th className="text-center px-3 py-2 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{t.employer_name}</td>
                  <td className="px-3 py-2 text-gray-500 truncate max-w-[200px]">
                    <a href={t.careers_page_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#1F4E79]">
                      {t.careers_page_url}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                    {t.last_scraped_at
                      ? new Date(t.last_scraped_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {t.is_active ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => deleteTarget(t.id)}
                      disabled={deletingId === t.id}
                      className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingId === t.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Target */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Scrape Target</h2>
        <form onSubmit={addTarget} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Employer name"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Careers page URL"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1F4E79] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#163a5c] transition-colors"
          >
            Add Target
          </button>
          {addStatus && <p className="text-sm text-gray-600">{addStatus}</p>}
        </form>
      </div>
    </div>
  );
}
