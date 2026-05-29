import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Job — Utah Hospitality Insiders",
  description:
    "Reach qualified hospitality candidates across Utah. Post your open positions to Utah's dedicated hospitality jobs community.",
  openGraph: {
    title: "Hire Utah Hospitality Talent | Utah Hospitality Insiders",
    description: "Post your open positions and reach thousands of qualified local candidates.",
    type: "website",
  },
};

const TIERS = [
  {
    name: "Free (Small Business)",
    badge: "Available",
    badgeColor: "bg-green-100 text-green-800",
    description: "Under 50 employees or 2 locations",
    features: [
      "1 active job listing",
      "30-day posting duration",
      "Basic listing placement",
      "Standard search results",
    ],
    available: true,
  },
  {
    name: "Standard",
    badge: "Coming Soon",
    badgeColor: "bg-gray-100 text-gray-600",
    description: "Enhanced placement and analytics",
    features: [
      "Up to 10 active listings",
      "Priority placement in search",
      "View and click analytics",
      "Company profile page",
      "Email support",
    ],
    highlighted: true,
    available: false,
  },
  {
    name: "Sponsored",
    badge: "Coming Soon",
    badgeColor: "bg-gray-100 text-gray-600",
    description: "Maximum visibility and reach",
    features: [
      "Unlimited job listings",
      "Top placement + Featured badge",
      "Email and SMS alerts to matched candidates",
      "Daily Facebook group exposure",
      "Full analytics dashboard",
      "Dedicated account support",
    ],
    available: false,
  },
];

const WHY_US = [
  {
    title: "Focused Audience",
    description:
      "Every visitor is actively looking for hospitality work in Utah. No wasted impressions on unrelated job seekers.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Fresh Daily Traffic",
    description:
      "Job seekers check back daily for new listings. Your openings get seen by active candidates, not stale profiles.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Facebook Community Reach",
    description:
      "Sponsored listings get shared in our Utah hospitality Facebook groups, reaching thousands of local industry workers.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
];

export default function EmployersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1F4E79] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hire Utah&apos;s Best Hospitality Talent
          </h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Post your open positions to Utah&apos;s dedicated hospitality jobs community — and
            reach thousands of qualified local candidates.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg p-7 flex flex-col ${
                  tier.highlighted
                    ? "bg-[#1F4E79] text-white ring-2 ring-[#1F4E79] shadow-lg md:scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                    {tier.name}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tier.highlighted ? "bg-white/20 text-white" : tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${tier.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                  {tier.description}
                </p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <svg
                        className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlighted ? "text-blue-200" : "text-green-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.available ? (
                  <a
                    href="/employer/register"
                    className="mt-6 block w-full py-2.5 rounded-lg font-medium text-center bg-[#1F4E79] text-white hover:bg-[#163a5c] transition-colors"
                  >
                    Get Started Free
                  </a>
                ) : (
                  <button
                    disabled
                    className={`mt-6 w-full py-2.5 rounded-lg font-medium ${
                      tier.highlighted
                        ? "bg-white/20 text-white cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Why Utah Hospitality Insiders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_US.map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900">Running multiple properties?</h2>
          <p className="text-gray-600 mt-2">
            Ask about our Annual Premium packages starting at $3,000/year. Includes unlimited
            listings across all locations, dedicated support, and custom analytics.
          </p>
          <a
            href="mailto:info@utahhospitalityinsiders.com?subject=Annual Premium Inquiry"
            className="mt-4 inline-block bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
