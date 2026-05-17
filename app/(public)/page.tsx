import SearchBar from "@/components/ui/SearchBar";
import BlogCard from "@/components/ui/BlogCard";
import { getAllPosts } from "@/lib/blog/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utah Hospitality Insiders — Utah's Hospitality Jobs Community",
  description: "Find hotel, restaurant, and resort jobs across Utah. Built by insiders, for insiders.",
  openGraph: {
    title: "Utah Hospitality Insiders — Utah's Hospitality Jobs Community",
    description: "Find hotel, restaurant, and resort jobs across Utah — or connect with qualified local candidates.",
    type: "website",
  },
};

const VALUE_PROPS = [
  {
    title: "Fresh Daily Listings",
    description: "New hospitality jobs added every day from employers and career pages across Utah.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Utah Focused",
    description: "Every listing is in Utah. No scrolling past irrelevant jobs in other states.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Free for Small Business",
    description: "Independent restaurants and small properties can post jobs at no cost.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Insider Resources",
    description: "Career tips, salary insights, and industry news from Utah hospitality veterans.",
    icon: (
      <svg className="w-8 h-8 text-[#1F4E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1F4E79] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Utah&apos;s Hospitality Jobs Community
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Find hotel, restaurant, and resort jobs across Utah — or connect with
            qualified local candidates. Built by insiders, for insiders.
          </p>
          <div className="mt-8 flex justify-center">
            <SearchBar preserveParams={false} />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="flex justify-center mb-4">{prop.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg">{prop.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest from the Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
