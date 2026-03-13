"use client";

import Link from "next/link";
import type { DocumentRecord } from "@/types/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { Card, CardContent } from "@/components/ui/card";

function DocumentList({ documents }: { documents: DocumentRecord[] }) {
  if (!documents.length) {
    return <p className="text-sm text-zinc-500">Nenhum documento nesta aba.</p>;
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-medium">{doc.title}</p>
              <p className="text-xs text-zinc-500">{new Date(doc.created_at).toLocaleString("pt-BR")}</p>
            </div>
            <div className="flex items-center gap-3">
              <DocumentStatusBadge status={doc.status} />
              <Link className="text-sm underline" href={`/documentos/${doc.id}`}>
                Ver detalhes
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DocumentTabs({ documents, userId }: { documents: DocumentRecord[]; userId: string }) {
  const toSign = documents.filter((d) => d.receiver_id === userId && d.status === "pending_signature");
  const sent = documents.filter((d) => d.sender_id === userId);
  const signed = documents.filter((d) => d.status !== "pending_signature");

  return (
    <Tabs defaultValue="to-sign">
      <TabsList>
        <TabsTrigger value="to-sign">Para assinar</TabsTrigger>
        <TabsTrigger value="sent">Enviados</TabsTrigger>
        <TabsTrigger value="signed">Assinados</TabsTrigger>
      </TabsList>
      <TabsContent value="to-sign">
        <DocumentList documents={toSign} />
      </TabsContent>
      <TabsContent value="sent">
        <DocumentList documents={sent} />
      </TabsContent>
      <TabsContent value="signed">
        <DocumentList documents={signed} />
      </TabsContent>
    </Tabs>
  );
}
