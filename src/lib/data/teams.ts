import { createClient } from "@/lib/supabase/server"
import type { Team, Roster } from "@/lib/teams-shared"

export async function getCurrentMemberId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getTeams(): Promise<(Team & { member_count: number })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("teams")
    .select(
      "id, name, description, leader_id, color_tag, icon, created_at, leader:members!teams_leader_id_fkey(id, full_name, email, license), team_members(member_id)",
    )
    .order("created_at", { ascending: true })

  return ((data ?? []) as unknown as (Team & { team_members: { member_id: string }[] })[]).map(
    (t) => ({ ...t, member_count: t.team_members?.length ?? 0 }),
  )
}

export async function getTeam(id: string): Promise<Team | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("teams")
    .select(
      "id, name, description, leader_id, color_tag, icon, created_at, leader:members!teams_leader_id_fkey(id, full_name, email, license)",
    )
    .eq("id", id)
    .single()
  return data as unknown as Team | null
}

export async function getTeamMemberIds(teamId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("team_members").select("member_id").eq("team_id", teamId)
  return (data ?? []).map((r) => r.member_id)
}

export async function getRoster(): Promise<Roster[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("members")
    .select("id, full_name, email, license, seat, is_owner")
    .order("full_name", { ascending: true })
  return (data ?? []) as Roster[]
}

export async function canInviteMembers(memberId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: member } = await supabase
    .from("members")
    .select("is_owner")
    .eq("id", memberId)
    .single()
  if (member?.is_owner) return true

  const { data: leadershipTeam } = await supabase
    .from("teams")
    .select("id")
    .ilike("name", "Leadership Team")
    .maybeSingle()
  if (!leadershipTeam) return false

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("team_id", leadershipTeam.id)
    .eq("member_id", memberId)
    .maybeSingle()

  return !!membership
}
