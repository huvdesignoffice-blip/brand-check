export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Brand Check Admin</h1>
              <nav className="flex gap-1">
                <NavLink href="/admin" label="Dashboard" />
                <NavLink href="/admin/brand-check" label="Brand Check" />
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.name ?? "User"}</span>
                {user?.email && <span className="text-gray-400 ml-2 hidden sm:inline">{user.email}</span>}
              </div>
              <a href="/api/auth/signout?callbackUrl=/" className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">Sign out</a>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
      {label}
    </Link>
  );
}