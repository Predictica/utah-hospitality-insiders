import Link from "next/link";

export const metadata = {
  title: "Post a Job — Utah Hospitality Insiders",
  description: "Reach qualified hospitality candidates across Utah. Free tier available for small businesses.",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "For small businesses with under 25 employees",
    features: [
      "1 active job listing",
      "30-day posting duration",
      "Basic listing placement",
      "Email support",
    ],
  },
  {
    name: "Standard",
    price: "$49/mo",
    description: "For growing hospitality businesses",
    features: [
      "5 active job listings",
      "30-day posting duration",
      "Priority placement in search",
      "Company profile page",
      "Applicant tracking",
    ],
    highlighted: true,
  },
  {
    name: "Sponsored",
    price: "$99/mo",
    description: "Maximum visibility for your openings",
    features: [
      "Unlimited job listings",
      "Featured badge on all listings",
      "Top of search results",
      "Job alert distribution",
      "Analytics dashboard",
      "Dedicated support",
    ],
  },
];

export default function EmployersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Hire Utah&apos;s Best Hospitality Talent
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Post your open positions and connect with experienced hospitality
          professionals across Utah. Free tier available for small businesses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg p-8 ${
              tier.highlighted
                ? "bg-[#1F4E79] text-white ring-2 ring-[#1F4E79] shadow-lg scale-105"
                : "bg-white border border-gray-200"
            }`}
          >
            <h3 className={`text-xl font-bold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
              {tier.name}
            </h3>
            <p className={`text-3xl font-bold mt-2 ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
              {tier.price}
            </p>
            <p className={`text-sm mt-1 ${tier.highlighted ? "text-blue-200" : "text-gray-500"}`}>
              {tier.description}
            </p>
            <ul className="mt-6 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <svg
                    className={`w-5 h-5 shrink-0 ${tier.highlighted ? "text-blue-200" : "text-green-500"}`}
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
            <Link
              href="mailto:info@utahhospitalityinsiders.com?subject=Employer Inquiry"
              className={`mt-8 block text-center py-2.5 rounded-lg font-medium transition-colors ${
                tier.highlighted
                  ? "bg-white text-[#1F4E79] hover:bg-blue-50"
                  : "bg-[#1F4E79] text-white hover:bg-[#163a5c]"
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
