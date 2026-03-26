import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { addDocumentEvent, getDocumentWithParticipants } from "@/lib/documents/service";
import { rejectDocumentSchema } from "@/lib/validators/document";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = getSupabaseAdmin();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const parsed = rejectDocumentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }

    const doc = await getDocumentWithParticipants(id);
    if (!doc.data) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
    if (doc.data.receiver_id !== authData.user.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    if (doc.data.status !== "pending_signature") {
      return NextResponse.json({ error: "Este documento não pode mais ser rejeitado." }, { status: 400 });
    }

    const update = await supabaseAdmin
      .from("documents")
      .update({
        status: "rejected",
        rejection_reason: parsed.data.reason
      })
      .eq("id", doc.data.id)
      .select("id")
      .single();

    if (!update.data) {
      return NextResponse.json({ error: "Falha ao atualizar documento." }, { status: 500 });
    }

    await addDocumentEvent(doc.data.id, authData.user.id, "rejected");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
