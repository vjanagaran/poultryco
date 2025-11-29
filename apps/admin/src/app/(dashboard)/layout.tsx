import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { Providers } from "@/components/Providers";

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    <Providers>
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
            <DashboardNav />

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
    </Providers>
  );
}

