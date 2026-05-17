"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-[#1F4E79] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Utah Hospitality Insiders
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/jobs" className="hover:text-blue-200 transition-colors">
              Jobs
            </Link>
            <Link href="/blog" className="hover:text-blue-200 transition-colors">
              Blog
            </Link>
            <Link href="/employers" className="hover:text-blue-200 transition-colors">
              Post a Job
            </Link>
            <Link
              href="/candidates"
              className="bg-white text-[#1F4E79] px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              Get Job Alerts
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3 text-sm font-medium">
            <Link href="/jobs" className="hover:text-blue-200" onClick={() => setMobileOpen(false)}>
              Jobs
            </Link>
            <Link href="/blog" className="hover:text-blue-200" onClick={() => setMobileOpen(false)}>
              Blog
            </Link>
            <Link href="/employers" className="hover:text-blue-200" onClick={() => setMobileOpen(false)}>
              Post a Job
            </Link>
            <Link
              href="/candidates"
              className="bg-white text-[#1F4E79] px-4 py-2 rounded-md text-center"
              onClick={() => setMobileOpen(false)}
            >
              Get Job Alerts
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
