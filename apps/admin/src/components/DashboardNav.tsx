'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/dashboard"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📊</span>
        <span className="font-medium">Dashboard</span>
      </Link>
      
      {/* Blog */}
      <Link
        href="/blog"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/blog")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📝</span>
        <span className="font-medium">Blog Posts</span>
      </Link>
      
      {/* Forms Section */}
      <div className="pt-4 pb-2 px-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Forms
        </div>
      </div>
      <Link
        href="/forms/early-access"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/forms/early-access"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>🎯</span>
        <span className="font-medium">Early Access</span>
      </Link>
      <Link
        href="/forms/newsletter"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/forms/newsletter"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📰</span>
        <span className="font-medium">Newsletter</span>
      </Link>
      <Link
        href="/forms/contact"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/forms/contact"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>✉️</span>
        <span className="font-medium">Contact</span>
      </Link>
      
      {/* NECC Section */}
      <div className="pt-4 pb-2 px-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          NECC System
        </div>
      </div>
      <Link
        href="/necc"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/necc")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>🥚</span>
        <span className="font-medium">NECC Dashboard</span>
      </Link>
      
      {/* Marketing Section */}
      <div className="pt-4 pb-2 px-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Marketing
        </div>
      </div>
      <Link
        href="/marketing"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/marketing"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>🎯</span>
        <span className="font-medium">Dashboard</span>
      </Link>
      <Link
        href="/marketing/topics"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/topics")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>💡</span>
        <span className="font-medium">NDP Topics</span>
      </Link>
      <Link
        href="/marketing/segments"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/segments")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>👥</span>
        <span className="font-medium">Segments</span>
      </Link>
      <Link
        href="/marketing/pillars"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/pillars")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>🏛️</span>
        <span className="font-medium">Content Pillars</span>
      </Link>
      <Link
        href="/marketing/campaigns"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/campaigns")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>🚀</span>
        <span className="font-medium">Campaigns</span>
      </Link>
      <Link
        href="/marketing/channels"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/channels")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📱</span>
        <span className="font-medium">Channels</span>
      </Link>
      <Link
        href="/marketing/calendar"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/calendar")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📅</span>
        <span className="font-medium">Calendar</span>
      </Link>
      <Link
        href="/marketing/kpis"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/kpis")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📊</span>
        <span className="font-medium">KPIs</span>
      </Link>
      <Link
        href="/marketing/settings/tags"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/marketing/settings/tags")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>🏷️</span>
        <span className="font-medium">Tags</span>
      </Link>
      
      {/* Other Sections */}
      <div className="pt-4 pb-2 px-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Platform
        </div>
      </div>
      <Link
        href="/users"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/users")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>👥</span>
        <span className="font-medium">Users</span>
      </Link>
      <Link
        href="/analytics"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/analytics"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📈</span>
        <span className="font-medium">Analytics</span>
      </Link>
      <Link
        href="/email-campaigns"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/email-campaigns")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>📧</span>
        <span className="font-medium">Email Campaigns</span>
      </Link>
      <Link
        href="/feedback"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname.startsWith("/feedback")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>💬</span>
        <span className="font-medium">Feedback</span>
      </Link>
      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          pathname === "/settings"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span>⚙️</span>
        <span className="font-medium">Settings</span>
      </Link>
    </nav>
  );
}
