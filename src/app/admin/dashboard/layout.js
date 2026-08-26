import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { getAdminSession } from "@/lib/session";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }) {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar adminEmail={session.user.email} isSuperAdmin={session.user.isSuperAdmin} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
