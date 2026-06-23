"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCurrentUser, logout } from "@/lib/api/auth";
import { getMySubscription } from "@/lib/api/billing";
import { formatBytes, getResponseData, normalizeMySubscription } from "@/lib/billing/billingData";

function DriveIcon() {
  return (
    <svg viewBox="0 0 87.3 78" className="w-[26px] h-[26px]" aria-hidden="true">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

const normalizeCurrentUser = (payload) => {
  return payload?.user || payload?.data?.user || payload?.data || payload || null;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageSummary, setStorageSummary] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  const loggedIn = Boolean(currentUser);
  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    "User";
  const userEmail = currentUser?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    let ignore = false;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();

        if (!ignore) {
          setCurrentUser(normalizeCurrentUser(user));
        }

        try {
          const subscription = await getMySubscription();
          if (!ignore) {
            setStorageSummary(normalizeMySubscription(getResponseData(subscription)));
          }
        } catch {
          if (!ignore) {
            setStorageSummary(null);
          }
        }
      } catch {
        if (!ignore) {
          setCurrentUser(null);
          setStorageSummary(null);
        }
      }
    };

    const syncAuth = async (event) => {
      if (!event.detail?.authenticated) {
        setCurrentUser(null);
        setStorageSummary(null);
        return;
      }

      await loadCurrentUser();
    };

    loadCurrentUser();
    window.addEventListener("auth-change", syncAuth);

    return () => {
      ignore = true;
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsLoggingOut(true);

    try {
      await logout();
      setCurrentUser(null);
      setStorageSummary(null);
      router.push("/auth/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4 w-full">

          {/* ── Logo ── */}
          <Link href="/" className=" cursor-pointer flex items-center gap-2 shrink-0 group">
            <DriveIcon />
            <span className="text-[17px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Storix
            </span>
          </Link>

          {/* ── Search bar (shown when logged in) ── */}
          {loggedIn && (
            <div className="hidden sm:flex flex-1 mx-4">
              <div className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1a73e8] focus-within:shadow-md rounded-full px-4 py-2.5 transition-all duration-200">
                <SearchIcon />
                <input
                  type="search"
                  placeholder="Search in Drive"
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                  aria-label="Search files"
                />
              </div>
            </div>
          )}

          {/* ── Spacer when not logged in ── */}
          {!loggedIn && <div className="flex-1" />}

          {/* ── Desktop nav: logged out ── */}
          {!loggedIn && (
            <nav className="hidden md:flex items-center gap-1 mr-2">
              <a href="/features" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                Features
              </a>
              <a href="/pricing" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                Pricing
              </a>
            </nav>
          )}

          {/* ── Desktop right-side actions ── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {loggedIn ? (
              <>
                {/* Google apps grid */}
                <button
                  type="button"
                  aria-label="Google apps"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <GridIcon />
                </button>

                {/* User avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((v) => !v)}
                    aria-label="Account menu"
                    aria-expanded={userDropdownOpen}
                    className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8]"
                  >
                    {userInitial}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {userInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {userName}
                            </p>
                            {userEmail && (
                              <p className="text-xs text-gray-500 truncate">
                                {userEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Storage bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Storage</span>
                            <span>{storageSummary ? `${formatBytes(storageSummary.storageUsed)} of ${formatBytes(storageSummary.storageLimit)} used` : "Loading..."}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a73e8] rounded-full" style={{ width: `${storageSummary?.usagePercent || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="py-1.5">
                        <a href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </a>
                        <a href="/dashboard/billing" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Billing
                        </a>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {isLoggingOut ? "Signing out..." : "Sign out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-blue-50 rounded-full transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-semibold bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile menu toggle ── */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <HamburgerIcon open={mobileMenuOpen} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-3 space-y-1">
          {/* Mobile search */}
          {loggedIn && (
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2.5 mb-3">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search in Drive"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                aria-label="Search files"
              />
            </div>
          )}

          {!loggedIn && (
            <>
              <a href="/features" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Features
              </a>
              <a href="/pricing" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Pricing
              </a>
            </>
          )}

          {loggedIn ? (
            <>
              <a href="/settings" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Settings
              </a>
              <a href="/dashboard/billing" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Billing
              </a>
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/auth/login"
                className="block text-center px-4 py-2.5 text-sm font-medium text-[#1a73e8] border border-[#1a73e8] rounded-full hover:bg-blue-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="block text-center px-4 py-2.5 text-sm font-semibold bg-[#1a73e8] text-white rounded-full hover:bg-[#1557b0] transition-colors"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
