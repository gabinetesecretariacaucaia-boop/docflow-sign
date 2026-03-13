import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { ActivityTimeline } from "@/components/documents/activity-timeline";
import { SignedUploadForm } from "@/components/documents/signed-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DocumentEventRecord, DocumentRecord } from "@/types/document";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return notFound();

  const { data: docData } = await supabase.from("documents").select("*").eq("id", id).single();
  if (!docData) return notFound();

  const { data: eventsData } = await supabase
    .from("document_events")
    .select("*")
    .eq("document_id", id)
    .order("created_at", { ascending: true });

  const doc = docData as DocumentRecord;
  const events = (eventsData as DocumentEventRecord[]) ?? [];
  const isReceiver = doc.receiver_id === userData.user.id;
  const isSender = doc.sender_id === userData.user.id;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{doc.title}</h1>
        <DocumentStatusBadge status={doc.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a href={`/api/documents/${doc.id}/download-original`} target="_blank">
            <Button variant="outline">Baixar original</Button>
          </a>
          {doc.signed_file_url ? (
            <a href={`/api/documents/${doc.id}/download-signed`} target="_blank">
              <Button>Baixar assinado</Button>
            </a>
          ) : null}
          {isReceiver && doc.status === "pending_signature" ? <SignedUploadForm documentId={doc.id} /> : null}
          {isSender && !doc.signed_file_url ? (
            <p className="text-sm text-zinc-500">Aguardando upload assinado pelo receptor.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linha do tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline events={events} />
        </CardContent>
      </Card>
    </section>
  );
}
