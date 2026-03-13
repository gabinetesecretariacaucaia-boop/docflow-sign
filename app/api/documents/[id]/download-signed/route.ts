import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { addDocumentEvent, getDocumentWithParticipants, getUserById } from "@/lib/documents/service";
import { sendSenderDownloadedEmail } from "@/lib/email/resend";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAdmin = getSupabaseAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const doc = await getDocumentWithParticipants(id);
  if (!doc.data || !doc.data.signed_file_url) {
    return NextResponse.json({ error: "Documento assinado indisponível." }, { status: 404 });
  }

  if (![doc.data.sender_id, doc.data.receiver_id].includes(authData.user.id)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const signed = await supabaseAdmin.storage.from("documents-signed").createSignedUrl(doc.data.signed_file_url, 120);
  if (!signed.data?.signedUrl) return NextResponse.json({ error: "Falha ao gerar download." }, { status: 500 });

  if (authData.user.id === doc.data.sender_id) {
    await supabaseAdmin.from("documents").update({ status: "downloaded_by_sender" }).eq("id", doc.data.id);
    await addDocumentEvent(doc.data.id, authData.user.id, "downloaded_by_sender");

    const receiver = await getUserById(doc.data.receiver_id);
    if (receiver.data?.email) {
      await sendSenderDownloadedEmail({
        to: receiver.data.email,
        documentTitle: doc.data.title,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010"
      });
    }
  }

  return NextResponse.redirect(signed.data.signedUrl);
}
