import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-poultryco-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">PoultryCo</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📊</span>
              <span className="font-medium">Dashboard</span>
            </a>
            
            {/* Blog */}
            <a
              href="/blog"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📝</span>
              <span className="font-medium">Blog Posts</span>
            </a>
            
            {/* Forms Section */}
            <div className="pt-4 pb-2 px-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Forms
              </div>
            </div>
            <a
              href="/forms/early-access"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>🎯</span>
              <span className="font-medium">Early Access</span>
            </a>
            <a
              href="/forms/newsletter"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📰</span>
              <span className="font-medium">Newsletter</span>
            </a>
            <a
              href="/forms/contact"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>✉️</span>
              <span className="font-medium">Contact</span>
            </a>
            
            {/* Other Sections */}
            <div className="pt-4 pb-2 px-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Platform
              </div>
            </div>
            <a
              href="/users"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>👥</span>
              <span className="font-medium">Users</span>
            </a>
            <a
              href="/analytics"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📈</span>
              <span className="font-medium">Analytics</span>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>⚙️</span>
              <span className="font-medium">Settings</span>
            </a>
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-poultryco-green rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.email}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

