import type { DocumentStatus } from "@/types/document";
import { Badge } from "@/components/ui/badge";

const config: Record<DocumentStatus, { label: string; variant: "warning" | "info" | "success" | "destructive" }> = {
  pending_signature: { label: "Pendente de assinatura", variant: "warning" },
  signed_uploaded: { label: "Assinado enviado", variant: "info" },
  downloaded_by_sender: { label: "Concluído", variant: "success" },
  rejected: { label: "Rejeitado", variant: "destructive" }
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const item = config[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
