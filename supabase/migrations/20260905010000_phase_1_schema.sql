create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  timezone text not null default 'America/New_York',
  time_format text not null default '12h' check (time_format in ('12h', '24h')),
  week_starts_on integer not null default 0 check (week_starts_on in (0, 1)),
  default_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  color text not null default '#0f766e',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete restrict,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  weekly_target_minutes integer check (weekly_target_minutes is null or weekly_target_minutes >= 0),
  hourly_rate numeric(12, 2) check (hourly_rate is null or hourly_rate >= 0),
  currency text not null default 'USD',
  color text not null default '#2563eb',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete restrict,
  task_description text,
  notes text,
  clock_in timestamptz not null,
  clock_out timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_sessions_clock_order check (clock_out is null or clock_out > clock_in)
);

create unique index work_sessions_one_active_per_user
  on public.work_sessions (user_id)
  where clock_out is null;

create index companies_user_id_idx on public.companies (user_id);
create index companies_user_archived_idx on public.companies (user_id, is_archived);
create index projects_user_id_idx on public.projects (user_id);
create index projects_company_id_idx on public.projects (company_id);
create index projects_user_archived_idx on public.projects (user_id, is_archived);
create index projects_company_archived_idx on public.projects (company_id, is_archived);
create index work_sessions_user_clock_in_idx on public.work_sessions (user_id, clock_in desc);
create index work_sessions_project_clock_in_idx on public.work_sessions (project_id, clock_in desc);
create index work_sessions_active_user_idx on public.work_sessions (user_id) where clock_out is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_work_sessions_updated_at
  before update on public.work_sessions
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    timezone,
    time_format,
    week_starts_on,
    default_currency
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'America/New_York'),
    coalesce(nullif(new.raw_user_meta_data ->> 'time_format', ''), '12h'),
    coalesce(nullif(new.raw_user_meta_data ->> 'week_starts_on', '')::integer, 0),
    coalesce(nullif(new.raw_user_meta_data ->> 'default_currency', ''), 'USD')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.projects enable row level security;
alter table public.work_sessions enable row level security;

create policy "Users can select their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using ((select auth.uid()) = id);

create policy "Users can select their own companies"
  on public.companies for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own companies"
  on public.companies for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own companies"
  on public.companies for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own companies"
  on public.companies for delete
  using ((select auth.uid()) = user_id);

create policy "Users can select their own projects"
  on public.projects for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert projects for their own companies"
  on public.projects for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.companies
      where companies.id = projects.company_id
      and companies.user_id = (select auth.uid())
    )
  );

create policy "Users can update projects for their own companies"
  on public.projects for update
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.companies
      where companies.id = projects.company_id
      and companies.user_id = (select auth.uid())
    )
  );

create policy "Users can delete their own projects"
  on public.projects for delete
  using ((select auth.uid()) = user_id);

create policy "Users can select their own work sessions"
  on public.work_sessions for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert work sessions for their own projects"
  on public.work_sessions for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.projects
      where projects.id = work_sessions.project_id
      and projects.user_id = (select auth.uid())
    )
  );

create policy "Users can update work sessions for their own projects"
  on public.work_sessions for update
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.projects
      where projects.id = work_sessions.project_id
      and projects.user_id = (select auth.uid())
    )
  );

create policy "Users can delete their own work sessions"
  on public.work_sessions for delete
  using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.work_sessions to authenticated;
