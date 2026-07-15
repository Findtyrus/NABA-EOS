-- ============================================================
-- NABA app — full consolidated schema for a fresh Supabase project
-- ============================================================

-- MEMBERS -----------------------------------------------------
create table public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  seat text,
  email text not null,
  is_owner boolean default false,
  license boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

create policy "members can view all members"
  on public.members for select
  using (auth.uid() is not null);

create policy "members can insert own row"
  on public.members for insert
  with check (auth.uid() = id);

create policy "members can update own row"
  on public.members for update
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.members (id, full_name, email, is_owner)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    (select count(*) from public.members) = 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- VTO (singleton) ----------------------------------------------
create table public.vto (
  id integer primary key default 1,
  core_values jsonb not null default '[]',
  purpose text,
  niche text,
  semester_target text,
  mkt_audience text,
  mkt_uniques jsonb not null default '[]',
  mkt_process text,
  mkt_guarantee text,
  core_focus_type text not null default 'purpose' check (core_focus_type in ('purpose', 'cause', 'passion')),
  eoy_date date,
  eoy_membership_goal numeric,
  eoy_financial_goal numeric,
  eoy_measurables jsonb not null default '[]',
  eoy_picture jsonb not null default '[]',
  next_year_date date,
  next_year_membership_goal numeric,
  next_year_financial_goal numeric,
  next_year_goals jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

insert into public.vto (id) values (1);

alter table public.vto enable row level security;
create policy "authed read vto" on public.vto for select using (auth.uid() is not null);
create policy "authed write vto" on public.vto for update using (auth.uid() is not null);

-- ACCOUNTABILITY CHART ------------------------------------------
create table public.accountability_chart (
  id uuid primary key default gen_random_uuid(),
  seat text not null,
  member_id uuid references public.members (id),
  duties text,
  sort_order integer default 0,
  parent_id uuid references public.accountability_chart (id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.accountability_chart enable row level security;
create policy "authed read chart" on public.accountability_chart for select using (auth.uid() is not null);
create policy "authed write chart" on public.accountability_chart for all using (auth.uid() is not null);

-- ROCKS -----------------------------------------------------------
create table public.rocks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.members (id),
  rock text not null,
  due_date date,
  status text not null default 'On Track',
  created_at timestamptz default now()
);

alter table public.rocks enable row level security;
create policy "authed read rocks" on public.rocks for select using (auth.uid() is not null);
create policy "authed write rocks" on public.rocks for all using (auth.uid() is not null);

-- SCORECARD -------------------------------------------------------
create table public.scorecard (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.members (id),
  metric text not null,
  target text,
  current_value text,
  status text not null default 'On',
  updated_at timestamptz default now()
);

alter table public.scorecard enable row level security;
create policy "authed read scorecard" on public.scorecard for select using (auth.uid() is not null);
create policy "authed write scorecard" on public.scorecard for all using (auth.uid() is not null);

-- ISSUES ------------------------------------------------------------
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  issue text not null,
  raised_by uuid references public.members (id),
  status text not null default 'Open',
  created_at timestamptz default now()
);

alter table public.issues enable row level security;
create policy "authed read issues" on public.issues for select using (auth.uid() is not null);
create policy "authed write issues" on public.issues for all using (auth.uid() is not null);

-- MEETINGS ------------------------------------------------------------
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  notes text,
  title text not null,
  meeting_type text not null default 'custom' check (meeting_type in ('weekly', 'planning', 'sync', 'custom')),
  duration_minutes integer not null default 90,
  start_time time not null default '09:00',
  recurrence text check (recurrence in ('weekly')),
  created_by uuid references public.members (id),
  created_at timestamptz not null default now()
);

alter table public.meetings enable row level security;
create policy "authed read meetings" on public.meetings for select using (auth.uid() is not null);
create policy "authed write meetings" on public.meetings for all using (auth.uid() is not null);

create table public.meeting_attendees (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  role text not null default 'attendee' check (role in ('owner', 'attendee')),
  primary key (meeting_id, member_id)
);

alter table public.meeting_attendees enable row level security;
create policy "authed read meeting_attendees" on public.meeting_attendees for select using (auth.uid() is not null);
create policy "authed write meeting_attendees" on public.meeting_attendees for all using (auth.uid() is not null);

create table public.meeting_agenda_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  sort_order integer not null default 0,
  label text not null,
  duration_minutes integer not null default 5,
  created_at timestamptz not null default now()
);

alter table public.meeting_agenda_items enable row level security;
create policy "authed read meeting_agenda_items" on public.meeting_agenda_items for select using (auth.uid() is not null);
create policy "authed write meeting_agenda_items" on public.meeting_agenda_items for all using (auth.uid() is not null);

-- TODOS ------------------------------------------------------------
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  todo text not null,
  owner_id uuid references public.members (id),
  due_date date,
  completed boolean not null default false,
  meeting_id uuid references public.meetings (id) on delete set null,
  notes text,
  action_label text,
  action_href text,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;
create policy "authed read todos" on public.todos for select using (auth.uid() is not null);
create policy "authed write todos" on public.todos for all using (auth.uid() is not null);

-- HEADLINES ------------------------------------------------------------
create table public.headlines (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  submitted_by uuid references public.members (id),
  meeting_id uuid references public.meetings (id) on delete set null,
  status text not null default 'to_review' check (status in ('to_review', 'reviewed')),
  created_at timestamptz not null default now()
);

alter table public.headlines enable row level security;
create policy "authed read headlines" on public.headlines for select using (auth.uid() is not null);
create policy "authed write headlines" on public.headlines for all using (auth.uid() is not null);

-- ASSESSMENTS ------------------------------------------------------------
create table public.assessment_checkups (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('org_checkup', 'culture_checkup')),
  survey_date date not null default current_date,
  ends_at date,
  created_by uuid references public.members (id),
  created_at timestamptz not null default now()
);

alter table public.assessment_checkups enable row level security;
create policy "authed read assessment_checkups" on public.assessment_checkups for select using (auth.uid() is not null);
create policy "authed write assessment_checkups" on public.assessment_checkups for all using (auth.uid() is not null);

create table public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  checkup_id uuid not null references public.assessment_checkups (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  answers jsonb not null default '{}',
  submitted_at timestamptz not null default now(),
  unique (checkup_id, member_id)
);

alter table public.assessment_responses enable row level security;
create policy "authed read assessment_responses" on public.assessment_responses for select using (auth.uid() is not null);
create policy "authed write assessment_responses" on public.assessment_responses for all using (auth.uid() is not null);

-- PROCESSES ------------------------------------------------------------
create table public.processes (
  id uuid primary key default gen_random_uuid(),
  process_name text not null,
  owner_id uuid references public.members (id),
  location text,
  status text not null default 'Not started',
  source_type text not null default 'scratch' check (source_type in ('upload', 'scratch')),
  file_path text,
  file_name text,
  file_size bigint,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

alter table public.processes enable row level security;
create policy "authed read processes" on public.processes for select using (auth.uid() is not null);
create policy "authed write processes" on public.processes for all using (auth.uid() is not null);

-- STORAGE: process-documents bucket ------------------------------------
insert into storage.buckets (id, name, public)
values ('process-documents', 'process-documents', false)
on conflict (id) do nothing;

create policy "authed read process-documents"
  on storage.objects for select
  using (bucket_id = 'process-documents' and auth.uid() is not null);

create policy "authed write process-documents"
  on storage.objects for all
  using (bucket_id = 'process-documents' and auth.uid() is not null);
