import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { getAdminSession } from "@/lib/session";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }) {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/login");

  return (
    <DashboardShell adminEmail={session.user.email} isSuperAdmin={session.user.isSuperAdmin}>
      {children}
    </DashboardShell>
  );
}
