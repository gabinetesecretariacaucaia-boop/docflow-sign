import { DocumentCategory, DocumentEventType, DocumentStatus } from "@/types/document";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; created_at: string };
        Insert: { id: string; email: string; created_at?: string };
        Update: { id?: string; email?: string; created_at?: string };
      };
      documents: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          sender_id: string;
          receiver_id: string;
          original_file_url: string;
          signed_file_url?: string | null;
          category?: DocumentCategory;
          status?: DocumentStatus;
          created_at?: string;
          signed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      document_events: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          event_type: DocumentEventType;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          event_type: DocumentEventType;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["document_events"]["Insert"]>;
      };
    };
  };
};
