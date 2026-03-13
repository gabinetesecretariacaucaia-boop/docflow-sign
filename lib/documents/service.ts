import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { DocumentEventType, DocumentRecord } from "@/types/document";

type UserRecord = { id: string; email: string };
type ServiceResponse<T> = { data: T | null; error: unknown };

export async function addDocumentEvent(documentId: string, userId: string, eventType: DocumentEventType) {
  const supabaseAdmin = getSupabaseAdmin();
  return supabaseAdmin.from("document_events").insert({
    document_id: documentId,
    user_id: userId,
    event_type: eventType
  });
}

export async function getDocumentWithParticipants(documentId: string): Promise<ServiceResponse<DocumentRecord>> {
  const supabaseAdmin = getSupabaseAdmin();
  const response = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();
  return { data: (response.data as DocumentRecord | null) ?? null, error: response.error };
}

export async function getUserByEmail(email: string): Promise<ServiceResponse<UserRecord>> {
  const supabaseAdmin = getSupabaseAdmin();
  const response = await supabaseAdmin.from("users").select("*").eq("email", email).single();
  return { data: (response.data as UserRecord | null) ?? null, error: response.error };
}

export async function getUserById(userId: string): Promise<ServiceResponse<UserRecord>> {
  const supabaseAdmin = getSupabaseAdmin();
  const response = await supabaseAdmin.from("users").select("*").eq("id", userId).single();
  return { data: (response.data as UserRecord | null) ?? null, error: response.error };
}
