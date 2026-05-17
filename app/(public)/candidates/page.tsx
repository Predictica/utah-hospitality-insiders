export const metadata = {
  title: "Get Job Alerts — Utah Hospitality Insiders",
  description: "Sign up for personalized job alerts and get notified when new hospitality jobs matching your preferences are posted in Utah.",
};

export default function CandidatesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Get Job Alerts
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Sign up to receive notifications when new jobs matching your preferences
          are posted. Choose email, SMS, or both.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <p className="text-center text-gray-500 py-8">
          Job alert signup form coming soon. In the meantime, browse our{" "}
          <a href="/jobs" className="text-[#1F4E79] hover:underline font-medium">
            current listings
          </a>
          .
        </p>
      </div>
    </div>
  );
}
