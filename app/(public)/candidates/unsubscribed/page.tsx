import Link from "next/link";

export const metadata = {
  title: "Unsubscribed — Utah Hospitality Insiders",
};

export default function UnsubscribedPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;ve Been Unsubscribed
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          You have been unsubscribed from Utah Hospitality Insiders job alerts.
          You will no longer receive email notifications about new job openings.
        </p>

        <div className="space-y-3">
          <p className="text-gray-500 text-sm">Changed your mind?</p>
          <Link
            href="/candidates"
            className="inline-block bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#163a5c] transition-colors"
          >
            Re-subscribe to Alerts
          </Link>
        </div>
      </div>
    </div>
  );
}
