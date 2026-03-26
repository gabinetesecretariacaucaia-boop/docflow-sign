"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RejectDocumentForm({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/documents/${documentId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });

    setLoading(false);
    if (!res.ok) {
      const text = await res.text();
      const json = (() => {
        try {
          return text ? JSON.parse(text) : {};
        } catch {
          return { error: "Resposta inválida do servidor." };
        }
      })();
      setError(json.error || "Falha ao rejeitar documento.");
      return;
    }

    setReason("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">Recusar assinatura</p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Descreva o motivo da recusa"
        required
        minLength={5}
        maxLength={500}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="destructive" disabled={loading}>
        {loading ? "Enviando..." : "Rejeitar documento"}
      </Button>
    </form>
  );
}
