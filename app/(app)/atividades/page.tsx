import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActivityTimeline } from "@/components/documents/activity-timeline";
import type { DocumentEventRecord } from "@/types/document";
type DocumentIdRow = { id: string };

export default async function ActivitiesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: docs } = await supabase
    .from("documents")
    .select("id")
    .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`);

  const ids = ((docs as DocumentIdRow[] | null) ?? []).map((d) => d.id);
  const { data: events } = ids.length
    ? await supabase.from("document_events").select("*").in("document_id", ids).order("created_at", { ascending: false })
    : { data: [] as DocumentEventRecord[] };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Atividades</h1>
      <ActivityTimeline events={(events as DocumentEventRecord[]) ?? []} />
    </section>
  );
}
