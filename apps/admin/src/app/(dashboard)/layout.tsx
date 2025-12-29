import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardNav } from "@/components/DashboardNav";
import { Providers } from "@/components/Providers";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get token from cookies (Next.js 15 requires await)
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    redirect("/login");
  }

  // Fetch user info from API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1';
  let user = null;
  
  try {
    const response = await fetch(`${apiUrl}/admin/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      redirect("/login");
    }

    const data = await response.json();
    user = data.user;
  } catch (_error) {
    redirect("/login");
  }

  if (!user) {
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
                  {user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.slug?.replace('_', ' ') || 'Admin'}</p>
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
