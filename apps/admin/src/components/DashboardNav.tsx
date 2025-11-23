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
