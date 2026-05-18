"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tier = "free" | "standard" | "sponsored";

export default function EmployerRegisterPage() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    contact_first: "",
    contact_last: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    website: "",
    number_of_locations: "",
    number_of_employees: "",
    small_business: false,
    terms: false,
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!form.terms) {
      setError("You must agree to the terms of service");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.company_name,
          contact_name: `${form.contact_first} ${form.contact_last}`,
          email: form.email,
          password: form.password,
          phone: form.phone,
          website: form.website || null,
          number_of_locations: parseInt(form.number_of_locations) || null,
          number_of_employees: parseInt(form.number_of_employees) || null,
          tier,
          is_small_business: form.small_business,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(
          `/employer/verify-email?email=${encodeURIComponent(form.email)}`
        );
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  const tierCards: { id: Tier; name: string; price: string; desc: string; selectable: boolean }[] = [
    {
      id: "free",
      name: "Free (Small Business)",
      price: "$0",
      desc: "Under 50 employees or 2 locations",
      selectable: true,
    },
    {
      id: "standard",
      name: "Standard",
      price: "$49–$79/mo",
      desc: "Coming soon",
      selectable: false,
    },
    {
      id: "sponsored",
      name: "Sponsored",
      price: "$149–$199/mo",
      desc: "Coming soon",
      selectable: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Employer Registration
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Create your employer account to start posting jobs.
      </p>

      {/* Tier Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Select Your Plan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tierCards.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => t.selectable && setTier(t.id)}
              disabled={!t.selectable}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                tier === t.id
                  ? "border-[#1F4E79] bg-blue-50"
                  : t.selectable
                  ? "border-gray-200 hover:border-gray-300"
                  : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
              }`}
            >
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-2xl font-bold text-[#1F4E79] mt-1">
                {t.price}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              {!t.selectable && (
                <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Business Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={form.company_name}
              onChange={(e) => update("company_name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact First Name *
              </label>
              <input
                type="text"
                required
                value={form.contact_first}
                onChange={(e) => update("contact_first", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Last Name *
              </label>
              <input
                type="text"
                required
                value={form.contact_last}
                onChange={(e) => update("contact_last", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password * (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={form.confirm_password}
                onChange={(e) => update("confirm_password", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Locations *
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.number_of_locations}
                onChange={(e) => update("number_of_locations", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Employees *
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.number_of_employees}
                onChange={(e) => update("number_of_employees", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
              />
            </div>
          </div>

          {tier === "free" && (
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.small_business}
                onChange={(e) => update("small_business", e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <span>
                I confirm this business has fewer than 50 employees or fewer
                than 2 locations
              </span>
            </label>
          )}

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => update("terms", e.target.checked)}
              className="mt-0.5 rounded border-gray-300"
              required
            />
            <span>
              I agree to the Utah Hospitality Insiders terms of service and
              confirm this is a legitimate Utah hospitality business
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1F4E79] text-white py-3 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70"
        >
          {loading ? "Creating Account..." : "Create Employer Account"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/employer/login"
            className="text-[#1F4E79] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
