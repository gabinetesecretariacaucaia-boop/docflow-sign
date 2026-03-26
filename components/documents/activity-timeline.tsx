import type { DocumentEventRecord } from "@/types/document";

const labels: Record<string, string> = {
  uploaded: "Documento enviado",
  sent: "Notificação enviada",
  downloaded_for_signature: "Receptor baixou para assinar",
  signed_uploaded: "Assinado enviado",
  downloaded_by_sender: "Remetente baixou assinado",
  rejected: "Documento rejeitado"
};

export function ActivityTimeline({ events }: { events: DocumentEventRecord[] }) {
  if (!events.length) return <p className="text-sm text-zinc-500">Sem atividades registradas.</p>;

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-md border bg-white p-3">
          <p className="font-medium">{labels[event.event_type] ?? event.event_type}</p>
          <p className="text-xs text-zinc-500">{new Date(event.created_at).toLocaleString("pt-BR")}</p>
        </li>
      ))}
    </ol>
  );
}
