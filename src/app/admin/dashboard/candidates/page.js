import { CandidatesManager } from "@/components/admin/candidates-manager";
import { getAdminSession } from "@/lib/session";

export default async function CandidatesAdminPage() {
  const session = await getAdminSession();
  return <CandidatesManager isSuperAdmin={Boolean(session?.user?.isSuperAdmin)} />;
}
