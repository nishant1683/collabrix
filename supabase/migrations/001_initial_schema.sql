create extension if not exists pgcrypto;

create type public.user_role as enum ('owner', 'admin', 'collaboration', 'branding', 'client');
create type public.enquiry_status as enum ('new', 'under_review', 'contacted', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text not null default '' check (char_length(company) <= 160),
  service text not null check (service in ('branding', 'content', 'digital', 'creative')),
  message text not null check (char_length(message) between 20 and 5000),
  status public.enquiry_status not null default 'new',
  source text not null default 'public-website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_status_idx on public.enquiries (status);

alter table public.profiles enable row level security;
alter table public.enquiries enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Admins can read enquiries"
  on public.enquiries for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('owner', 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
