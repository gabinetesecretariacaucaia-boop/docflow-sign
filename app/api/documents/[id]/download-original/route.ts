import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { addDocumentEvent, getDocumentWithParticipants } from "@/lib/documents/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAdmin = getSupabaseAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const doc = await getDocumentWithParticipants(id);
  if (!doc.data) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  if (![doc.data.sender_id, doc.data.receiver_id].includes(authData.user.id)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const signed = await supabaseAdmin.storage.from("documents-original").createSignedUrl(doc.data.original_file_url, 120);
  if (!signed.data?.signedUrl) return NextResponse.json({ error: "Falha ao gerar download." }, { status: 500 });

  if (authData.user.id === doc.data.receiver_id) {
    await addDocumentEvent(doc.data.id, authData.user.id, "downloaded_for_signature");
  }

  return NextResponse.redirect(signed.data.signedUrl);
}
