create type public.deal_status as enum (
  'requirement_received',
  'under_review',
  'proposal_sent',
  'negotiation',
  'awaiting_approval',
  'approved',
  'work_in_progress',
  'review_and_revision',
  'completed'
);

create type public.proposal_status as enum ('draft', 'sent', 'accepted', 'declined');
create type public.payment_status as enum ('pending', 'partially_paid', 'paid', 'overdue');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  requirement text not null check (char_length(requirement) between 20 and 5000),
  assigned_team public.user_role check (assigned_team in ('collaboration', 'branding')),
  status public.deal_status not null default 'requirement_received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deal_financials (
  deal_id uuid primary key references public.deals(id) on delete cascade,
  negotiated_amount numeric(12, 2) check (negotiated_amount >= 0),
  currency text not null default 'INR' check (char_length(currency) = 3),
  payment_status public.payment_status not null default 'pending',
  updated_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  version integer not null check (version > 0),
  title text not null check (char_length(title) between 1 and 160),
  scope text not null check (char_length(scope) between 20 and 5000),
  amount numeric(12, 2) check (amount >= 0),
  status public.proposal_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (deal_id, version)
);

create table public.deal_messages (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.deal_revisions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  description text not null check (char_length(description) between 10 and 3000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create table public.deal_files (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (char_length(mime_type) <= 120),
  file_size integer not null check (file_size > 0 and file_size <= 52428800),
  created_at timestamptz not null default now()
);

create index deals_client_id_idx on public.deals (client_id);
create index deals_status_idx on public.deals (status);
create index deal_messages_deal_id_idx on public.deal_messages (deal_id, created_at);
create index deal_revisions_deal_id_idx on public.deal_revisions (deal_id, created_at);

alter table public.deals enable row level security;
alter table public.deal_financials enable row level security;
alter table public.proposals enable row level security;
alter table public.deal_messages enable row level security;
alter table public.deal_revisions enable row level security;
alter table public.deal_files enable row level security;

create or replace function public.can_access_deal(target_deal_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.deals
    where id = target_deal_id
      and (
        client_id = auth.uid()
        or assigned_team = public.current_user_role()
        or public.current_user_role() in ('owner', 'admin')
      )
  );
$$;

revoke all on function public.can_access_deal(uuid) from public;
grant execute on function public.can_access_deal(uuid) to authenticated;

create policy "Deal participants can read deals"
  on public.deals for select to authenticated
  using (public.can_access_deal(id));

create policy "Admins can create deals"
  on public.deals for insert to authenticated
  with check (public.current_user_role() in ('owner', 'admin'));

create policy "Admins can update deals"
  on public.deals for update to authenticated
  using (public.current_user_role() in ('owner', 'admin'))
  with check (public.current_user_role() in ('owner', 'admin'));

create policy "Admins can read deal financials"
  on public.deal_financials for select to authenticated
  using (public.current_user_role() in ('owner', 'admin'));

create policy "Admins can manage deal financials"
  on public.deal_financials for all to authenticated
  using (public.current_user_role() in ('owner', 'admin'))
  with check (public.current_user_role() in ('owner', 'admin'));

create policy "Deal participants can read proposals"
  on public.proposals for select to authenticated
  using (public.can_access_deal(deal_id));

create policy "Admins can manage proposals"
  on public.proposals for all to authenticated
  using (public.current_user_role() in ('owner', 'admin'))
  with check (public.current_user_role() in ('owner', 'admin'));

create policy "Deal participants can read messages"
  on public.deal_messages for select to authenticated
  using (public.can_access_deal(deal_id));

create policy "Deal participants can send messages"
  on public.deal_messages for insert to authenticated
  with check (sender_id = auth.uid() and public.can_access_deal(deal_id));

create policy "Deal participants can read revisions"
  on public.deal_revisions for select to authenticated
  using (public.can_access_deal(deal_id));

create policy "Clients can request revisions"
  on public.deal_revisions for insert to authenticated
  with check (requested_by = auth.uid() and public.can_access_deal(deal_id));

create policy "Deal participants can read files"
  on public.deal_files for select to authenticated
  using (public.can_access_deal(deal_id));

create policy "Deal participants can register files"
  on public.deal_files for insert to authenticated
  with check (uploaded_by = auth.uid() and public.can_access_deal(deal_id));

insert into storage.buckets (id, name, public)
values ('deal-files', 'deal-files', false)
on conflict (id) do nothing;

create policy "Deal participants can read private deal files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'deal-files'
    and public.can_access_deal((storage.foldername(name))[1]::uuid)
  );
