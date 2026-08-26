import { redirect } from "next/navigation";
import { AdminsManager } from "@/components/admin/admins-manager";
import { getAdminSession } from "@/lib/session";

export default async function AdminsAdminPage() {
  const session = await getAdminSession();
  if (!session?.user?.isSuperAdmin) redirect("/admin/dashboard");

  return <AdminsManager />;
}
