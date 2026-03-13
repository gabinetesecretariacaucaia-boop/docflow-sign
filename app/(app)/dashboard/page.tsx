import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DocumentTabs } from "@/components/dashboard/document-tabs";
import type { DocumentRecord } from "@/types/document";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data } = await supabase
    .from("documents")
    .select("*")
    .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DocumentTabs documents={(data as DocumentRecord[]) ?? []} userId={userData.user.id} />
    </section>
  );
}
