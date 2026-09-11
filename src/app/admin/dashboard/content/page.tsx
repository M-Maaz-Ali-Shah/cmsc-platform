import { ContentManager } from "@/components/admin/content-manager";
import { listContentBlocks } from "@/app/actions/content";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminContentPage() {
  const user = await requireUser();
  const blocks = await listContentBlocks();

  return <ContentManager blocks={blocks} canEdit={["super_admin", "committee_admin"].includes(user.role)} />;
}
