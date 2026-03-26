alter type public.document_status add value if not exists 'rejected';

alter type public.document_event_type add value if not exists 'rejected';

alter table public.documents
add column if not exists rejection_reason text;
