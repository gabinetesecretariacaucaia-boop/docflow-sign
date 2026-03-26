export type DocumentStatus = "pending_signature" | "signed_uploaded" | "downloaded_by_sender" | "rejected";

export type DocumentCategory = "contract" | "agreement" | "legal" | "other";

export type DocumentEventType =
  | "uploaded"
  | "sent"
  | "downloaded_for_signature"
  | "signed_uploaded"
  | "downloaded_by_sender"
  | "rejected";

export interface DocumentRecord {
  id: string;
  title: string;
  sender_id: string;
  receiver_id: string;
  original_file_url: string;
  signed_file_url: string | null;
  category: DocumentCategory;
  status: DocumentStatus;
  created_at: string;
  signed_at: string | null;
  rejection_reason: string | null;
}

export interface DocumentEventRecord {
  id: string;
  document_id: string;
  user_id: string;
  event_type: DocumentEventType;
  created_at: string;
}
