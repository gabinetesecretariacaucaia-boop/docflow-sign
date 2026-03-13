"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignedUploadForm({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Selecione o arquivo assinado.");
      return;
    }
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/documents/${documentId}/upload-signed`, {
      method: "POST",
      body: formData
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
      setError(json.error || "Falha no upload.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar assinado"}
      </Button>
    </form>
  );
}
