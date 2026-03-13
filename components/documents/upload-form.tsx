"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }

    setError(null);
    setLoading(true);
    setProgress(15);

    const base64File = await toBase64(file);
    setProgress(45);

    const res = await fetch("/api/documents/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        receiverEmail,
        base64File,
        fileName: file.name
      })
    });

    setProgress(85);
    const text = await res.text();
    const json = (() => {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { error: "Resposta inválida do servidor." };
      }
    })();
    setLoading(false);
    setProgress(100);

    if (!res.ok) {
      setError(json.error || "Falha no envio.");
      return;
    }

    router.push(`/documentos/${json.documentId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo documento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiverEmail">E-mail do receptor</Label>
            <Input
              id="receiverEmail"
              type="email"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo original (PDF)</Label>
            <Input id="file" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          </div>
          {loading ? <Progress value={progress} /> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar para assinatura"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
