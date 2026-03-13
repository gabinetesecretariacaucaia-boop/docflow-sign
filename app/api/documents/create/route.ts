import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createDocumentSchema } from "@/lib/validators/document";
import { classifyDocument } from "@/lib/ai/classifier";
import { addDocumentEvent, getUserByEmail } from "@/lib/documents/service";
import { sendDocumentSentEmail } from "@/lib/email/resend";

function sanitizePdfFileName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safe = normalized
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");
  const withExt = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe || "documento"}.pdf`;
  return withExt.slice(0, 140);
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const parsed = createDocumentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }

    const senderId = authData.user.id;
    const { title, receiverEmail, base64File, fileName } = parsed.data;
    const receiver = await getUserByEmail(receiverEmail);

    if (!receiver.data) {
      return NextResponse.json({ error: "Receptor não encontrado." }, { status: 404 });
    }

    const binary = Buffer.from(base64File, "base64");
    const safeFileName = sanitizePdfFileName(fileName);
    const objectPath = `${senderId}/${crypto.randomUUID()}-${safeFileName}`;
    const upload = await supabaseAdmin.storage.from("documents-original").upload(objectPath, binary, {
      contentType: "application/pdf",
      upsert: false
    });

    if (upload.error) return NextResponse.json({ error: "Falha ao salvar arquivo." }, { status: 500 });

    const category = await classifyDocument(binary);
    const inserted = await supabaseAdmin
      .from("documents")
      .insert({
        title,
        sender_id: senderId,
        receiver_id: receiver.data.id,
        original_file_url: objectPath,
        category,
        status: "pending_signature"
      })
      .select("id,title")
      .single();

    if (!inserted.data) return NextResponse.json({ error: "Falha ao criar documento." }, { status: 500 });

    await addDocumentEvent(inserted.data.id, senderId, "uploaded");
    await addDocumentEvent(inserted.data.id, senderId, "sent");

    await sendDocumentSentEmail({
      to: receiver.data.email,
      documentTitle: inserted.data.title,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010"
    });

    return NextResponse.json({ documentId: inserted.data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
