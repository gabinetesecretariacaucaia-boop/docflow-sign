create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_status') then
    create type public.document_status as enum ('pending_signature', 'signed_uploaded', 'downloaded_by_sender');
  end if;

  if not exists (select 1 from pg_type where typname = 'document_category') then
    create type public.document_category as enum ('contract', 'agreement', 'legal', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'document_event_type') then
    create type public.document_event_type as enum ('uploaded', 'sent', 'downloaded_for_signature', 'signed_uploaded', 'downloaded_by_sender');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sender_id uuid not null references public.users(id) on delete restrict,
  receiver_id uuid not null references public.users(id) on delete restrict,
  original_file_url text not null,
  signed_file_url text,
  category public.document_category not null default 'other',
  status public.document_status not null default 'pending_signature',
  created_at timestamptz not null default now(),
  signed_at timestamptz
);

create table if not exists public.document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  event_type public.document_event_type not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_sender on public.documents(sender_id, created_at desc);
create index if not exists idx_documents_receiver on public.documents(receiver_id, created_at desc);
create index if not exists idx_documents_status on public.documents(status);
create index if not exists idx_events_document on public.document_events(document_id, created_at asc);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, 'sem-email'))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.document_events enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists documents_select_participant on public.documents;
create policy documents_select_participant
on public.documents
for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists documents_insert_sender_only on public.documents;
create policy documents_insert_sender_only
on public.documents
for insert
to authenticated
with check (sender_id = auth.uid());

drop policy if exists documents_update_participant on public.documents;
create policy documents_update_participant
on public.documents
for update
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid())
with check (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists events_select_participant on public.document_events;
create policy events_select_participant
on public.document_events
for select
to authenticated
using (
  exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.sender_id = auth.uid() or d.receiver_id = auth.uid())
  )
);

drop policy if exists events_insert_participant on public.document_events;
create policy events_insert_participant
on public.document_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.sender_id = auth.uid() or d.receiver_id = auth.uid())
  )
);

insert into storage.buckets (id, name, public)
values
  ('documents-original', 'documents-original', false),
  ('documents-signed', 'documents-signed', false)
on conflict (id) do nothing;

drop policy if exists original_select_participant on storage.objects;
create policy original_select_participant
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents-original'
  and exists (
    select 1 from public.documents d
    where d.original_file_url = name
      and (d.sender_id = auth.uid() or d.receiver_id = auth.uid())
  )
);

drop policy if exists original_insert_authenticated on storage.objects;
create policy original_insert_authenticated
on storage.objects
for insert
to authenticated
with check (bucket_id = 'documents-original');

drop policy if exists signed_select_participant on storage.objects;
create policy signed_select_participant
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents-signed'
  and exists (
    select 1 from public.documents d
    where d.signed_file_url = name
      and (d.sender_id = auth.uid() or d.receiver_id = auth.uid())
  )
);

drop policy if exists signed_insert_authenticated on storage.objects;
create policy signed_insert_authenticated
on storage.objects
for insert
to authenticated
with check (bucket_id = 'documents-signed');
