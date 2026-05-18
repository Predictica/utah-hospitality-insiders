"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsEmployer(!!user);
      } catch {
        setIsEmployer(false);
      }
    }
    checkAuth();
  }, [pathname]);

  async function handleLogout() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsEmployer(false);
      router.push("/");
      router.refresh();
    } catch {
      // silently fail
    }
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function linkClass(href: string) {
    return `transition-colors ${
      isActive(href) ? "text-white font-semibold" : "text-blue-200 hover:text-white"
    }`;
  }

  return (
    <header className="bg-[#1F4E79] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Utah Hospitality Insiders
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/jobs" className={linkClass("/jobs")}>
              Jobs
            </Link>
            <Link href="/blog" className={linkClass("/blog")}>
              Blog
            </Link>
            {isEmployer ? (
              <>
                <Link
                  href="/employer/dashboard"
                  className={linkClass("/employer")}
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/employer/login" className={linkClass("/employer")}>
                Post a Job
              </Link>
            )}
            <Link
              href="/candidates"
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/candidates")
                  ? "bg-white text-[#1F4E79]"
                  : "bg-white/90 text-[#1F4E79] hover:bg-white"
              }`}
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
            <Link href="/jobs" className={linkClass("/jobs")} onClick={() => setMobileOpen(false)}>
              Jobs
            </Link>
            <Link href="/blog" className={linkClass("/blog")} onClick={() => setMobileOpen(false)}>
              Blog
            </Link>
            {isEmployer ? (
              <>
                <Link
                  href="/employer/dashboard"
                  className={linkClass("/employer")}
                  onClick={() => setMobileOpen(false)}
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-blue-200 hover:text-white transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/employer/login"
                className={linkClass("/employer")}
                onClick={() => setMobileOpen(false)}
              >
                Post a Job
              </Link>
            )}
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
