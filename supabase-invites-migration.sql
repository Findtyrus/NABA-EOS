-- ============================================================
-- NABA app — invite-by-email migration
-- Run this once against your existing Supabase project (SQL editor).
-- Adds the ability for the chapter owner or Leadership Team members
-- to invite someone by email; when the invitee signs up with that
-- email, they're automatically added to the invite's team.
-- ============================================================

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token uuid not null default gen_random_uuid() unique,
  team_id uuid references public.teams (id) on delete set null,
  invited_by uuid references public.members (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table public.invites enable row level security;

-- Matches the "authed" convention used by every other table in this schema —
-- fine-grained permission (owner / Leadership Team) is enforced in the app's
-- server action, not in RLS, same as the rest of this codebase.
create policy "authed read invites"
  on public.invites for select
  using (auth.uid() is not null);

create policy "authed insert invites"
  on public.invites for insert
  with check (auth.uid() is not null);

create policy "authed update invites"
  on public.invites for update
  using (auth.uid() is not null);

-- Lets the public /invite/[token] page (visited before the invitee has an
-- account, so auth.uid() is null) look up just the email/team/status for
-- one token, without exposing the rest of the invites table to anon users.
create or replace function public.get_invite(p_token uuid)
returns table (email text, team_name text, status text)
language sql
security definer
set search_path = public
as $$
  select i.email, t.name, i.status
  from public.invites i
  left join public.teams t on t.id = i.team_id
  where i.token = p_token
$$;

grant execute on function public.get_invite(uuid) to anon, authenticated;

-- Extend the existing new-user trigger: if a pending invite matches the
-- new user's email, add them to the invite's team and mark it accepted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  matched_invite record;
begin
  insert into public.members (id, full_name, email, is_owner)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    (select count(*) from public.members) = 0
  )
  on conflict (id) do nothing;

  select * into matched_invite
  from public.invites
  where lower(email) = lower(new.email) and status = 'pending'
  order by created_at desc
  limit 1;

  if found then
    if matched_invite.team_id is not null then
      insert into public.team_members (team_id, member_id)
      values (matched_invite.team_id, new.id)
      on conflict do nothing;
    end if;

    update public.invites
    set status = 'accepted', accepted_at = now()
    where id = matched_invite.id;
  end if;

  return new;
end;
$$;
