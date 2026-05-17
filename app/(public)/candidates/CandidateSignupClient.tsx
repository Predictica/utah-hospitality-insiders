"use client";

import { useState } from "react";
import type { JobCategory } from "@/lib/types/database";

const REGIONS = [
  "Salt Lake City",
  "Park City",
  "Provo / Orem",
  "Ogden",
  "St. George",
  "Moab",
  "Statewide",
];

const AVAILABILITY = ["Full Time", "Part Time", "Weekends", "Seasonal"];

const EXPERIENCE = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

interface Props {
  categories: JobCategory[];
  prefillEmail: string;
}

export default function CandidateSignupClient({ categories, prefillEmail }: Props) {
  const hasEmail = !!prefillEmail;
  const [showFullForm, setShowFullForm] = useState(hasEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Quick signup
  const [quickFirst, setQuickFirst] = useState("");
  const [quickLast, setQuickLast] = useState("");
  const [quickEmail, setQuickEmail] = useState(prefillEmail);

  // Full form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");
  const [smsOptedIn, setSmsOptedIn] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [payMinimum, setPayMinimum] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  function handleSelectAllCategories() {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((c) => c.id));
    }
  }

  function handleStatewideToggle() {
    const nonStatewide = REGIONS.filter((r) => r !== "Statewide");
    if (selectedRegions.includes("Statewide")) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions([...nonStatewide, "Statewide"]);
    }
  }

  async function submitQuick(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    const res = await fetch("/api/candidates/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: quickFirst,
        last_name: quickLast,
        email: quickEmail,
      }),
    });
    const data = await res.json();

    if (data.success) {
      setStatus("success");
      setMessage(data.message);
    } else {
      setError(data.error || "Something went wrong.");
      setStatus("idle");
    }
  }

  async function submitFull(e: React.FormEvent, skipPreferences = false) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    const body = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: smsOptedIn ? phone : null,
      sms_opted_in: smsOptedIn,
      preferred_categories: skipPreferences ? [] : selectedCategories,
      preferred_locations: skipPreferences ? [] : selectedRegions.filter((r) => r !== "Statewide"),
      availability: skipPreferences ? [] : selectedAvailability,
      pay_minimum: skipPreferences ? null : payMinimum || null,
      years_experience: skipPreferences ? null : yearsExperience || null,
    };

    const res = await fetch("/api/candidates/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      setStatus("success");
      setMessage(data.message);
    } else {
      setError(data.error || "Something went wrong.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <svg className="mx-auto w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">{message}</h2>
          <p className="text-gray-600 mt-3">
            Know someone looking for work in Utah hospitality?
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + "/candidates");
            }}
            className="mt-3 text-[#1F4E79] font-medium hover:underline text-sm"
          >
            Copy link to share this page
          </button>
        </div>
      </div>
    );
  }

  // State 2: returning visitor with pre-filled email
  if (hasEmail) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Job Alerts</h1>
        <p className="text-gray-600 mb-8">
          Takes about 60 seconds. Everything except email is optional.
        </p>
        {renderFullForm()}
      </div>
    );
  }

  // State 1: new visitor
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Value prop */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Get Utah Hospitality Insider Job Alerts
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Join Utah&apos;s hospitality community. Get notified the moment jobs matching your
          skills and schedule are posted. Plus get access to training guides, industry news,
          and insider resources — free.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
          {[
            "Instant job alerts by email or text",
            "Training guides and bartending resources",
            "New restaurant and hotel openings",
            "Utah hospitality industry news",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {!showFullForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Quick signup */}
          <div className="bg-white border-2 border-[#1F4E79] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Just the alerts, please</h2>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;ll send you all new Utah hospitality job postings. You can customize preferences anytime.
            </p>
            <form onSubmit={submitQuick} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={quickFirst}
                  onChange={(e) => setQuickFirst(e.target.value)}
                  placeholder="First name *"
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
                />
                <input
                  type="text"
                  value={quickLast}
                  onChange={(e) => setQuickLast(e.target.value)}
                  placeholder="Last name *"
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
                />
              </div>
              <input
                type="email"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                placeholder="Email address *"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#1F4E79] text-white py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing up...
                  </>
                ) : (
                  "Sign Me Up"
                )}
              </button>
              <p className="text-xs text-gray-400 text-center">No spam. Unsubscribe anytime. Free.</p>
            </form>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>

          {/* Full preferences card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900">Customize my alerts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tell us what you&apos;re looking for and we&apos;ll only send you relevant matches.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Choose your preferred job categories
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pick your preferred Utah regions
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Set your schedule and pay preferences
              </li>
            </ul>
            <button
              onClick={() => setShowFullForm(true)}
              className="mt-6 w-full border border-[#1F4E79] text-[#1F4E79] py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Set My Preferences
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">{renderFullForm()}</div>
      )}
    </div>
  );

  function renderFullForm() {
    return (
      <form onSubmit={(e) => submitFull(e)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={smsOptedIn}
              onChange={(e) => setSmsOptedIn(e.target.checked)}
              className="rounded border-gray-300 text-[#1F4E79] focus:ring-[#1F4E79]"
            />
            Also send me SMS text alerts <span className="text-gray-400">(optional)</span>
          </label>
          {smsOptedIn && (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          )}
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Preferred job categories <span className="text-gray-400">(optional)</span>
            </label>
            <button
              type="button"
              onClick={handleSelectAllCategories}
              className="text-xs text-[#1F4E79] hover:underline"
            >
              {selectedCategories.length === categories.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => setSelectedCategories(toggleArrayItem(selectedCategories, cat.id))}
                  className="rounded border-gray-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Preferred Utah regions <span className="text-gray-400">(optional)</span>
            </label>
            <button
              type="button"
              onClick={handleStatewideToggle}
              className="text-xs text-[#1F4E79] hover:underline"
            >
              {selectedRegions.includes("Statewide") ? "Deselect All" : "Statewide"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REGIONS.filter((r) => r !== "Statewide").map((region) => (
              <label key={region} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => setSelectedRegions(toggleArrayItem(selectedRegions, region))}
                  className="rounded border-gray-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                />
                {region}
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability <span className="text-gray-400">(optional)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABILITY.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAvailability.includes(a)}
                  onChange={() => setSelectedAvailability(toggleArrayItem(selectedAvailability, a))}
                  className="rounded border-gray-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                />
                {a}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum pay expectation <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={payMinimum}
                onChange={(e) => setPayMinimum(e.target.value)}
                placeholder="e.g. 15"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of experience <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            >
              <option value="">Select...</option>
              {EXPERIENCE.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex-1 bg-[#1F4E79] text-white py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save My Preferences"
            )}
          </button>
          <button
            type="button"
            onClick={(e) => submitFull(e as unknown as React.FormEvent, true)}
            disabled={status === "loading"}
            className="text-sm text-[#1F4E79] hover:underline font-medium py-2.5"
          >
            Skip — just send me everything
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">No spam. Unsubscribe anytime. Free.</p>
      </form>
    );
  }
}
