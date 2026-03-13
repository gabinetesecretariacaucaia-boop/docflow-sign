import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { uploadSignedSchema } from "@/lib/validators/document";
import { addDocumentEvent, getDocumentWithParticipants, getUserById } from "@/lib/documents/service";
import { sendSignedUploadedEmail } from "@/lib/email/resend";

function sanitizePdfFileName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safe = normalized
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");
  const withExt = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe || "documento-assinado"}.pdf`;
  return withExt.slice(0, 140);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    let fileName = "";
    let binary = Buffer.alloc(0);

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
      fileName = file.name || "documento-assinado.pdf";
      binary = Buffer.from(await file.arrayBuffer());
    } else {
      const parsed = uploadSignedSchema.safeParse(await request.json());
      if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
      fileName = parsed.data.fileName;
      binary = Buffer.from(parsed.data.base64File, "base64");
    }

    if (!fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Envie um arquivo PDF." }, { status: 400 });
    }
    if (!binary.length) {
      return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
    }

    const doc = await getDocumentWithParticipants(id);
    if (!doc.data) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
    if (doc.data.receiver_id !== authData.user.id) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

    const safeFileName = sanitizePdfFileName(fileName);
    const objectPath = `${authData.user.id}/${crypto.randomUUID()}-${safeFileName}`;
    const upload = await supabaseAdmin.storage.from("documents-signed").upload(objectPath, binary, {
      contentType: "application/pdf",
      upsert: false
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message || "Falha no upload." }, { status: 500 });
    }

    await supabaseAdmin
      .from("documents")
      .update({
        signed_file_url: objectPath,
        status: "signed_uploaded",
        signed_at: new Date().toISOString()
      })
      .eq("id", doc.data.id);

    await addDocumentEvent(doc.data.id, authData.user.id, "signed_uploaded");

    const sender = await getUserById(doc.data.sender_id);
    if (sender.data?.email) {
      await sendSignedUploadedEmail({
        to: sender.data.email,
        documentTitle: doc.data.title,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010"
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
