"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function PlatformHeader() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const loading = authLoading;

  const platformNav = [
    { title: "Home", href: "/home", icon: "🏠" },
    { title: "Network", href: "/members", icon: "👥" },
    { title: "Stream", href: "/stream", icon: "📰" },
    { title: "Messages", href: "/messages", icon: "💬" },
    { title: "Tools", href: "/tools", icon: "🛠️" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              PoultryCo
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search members, businesses, tools..."
                className="w-full px-4 py-2 pl-10 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onFocus={() => router.push('/search')}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {platformNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive(item.href)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link
              href="/me"
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2"
            >
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt="Me"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {profile?.full_name?.[0] || user?.user_metadata?.full_name?.[0] || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                Me
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-4 space-y-2 border-t border-gray-200 bg-white">
            {/* Mobile Search */}
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-gray-600">Search...</span>
            </Link>

            {/* Mobile Nav Links */}
            {platformNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive(item.href)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

