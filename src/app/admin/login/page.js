import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/session";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
