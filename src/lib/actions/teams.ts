"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return supabase
}

export type TeamInput = {
  name: string
  description: string | null
  leaderId: string | null
  colorTag: string | null
  icon: string | null
}

export async function createTeam(input: TeamInput) {
  const supabase = await requireUser()
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: input.name,
      description: input.description,
      leader_id: input.leaderId,
      color_tag: input.colorTag,
      icon: input.icon,
    })
    .select("id")
    .single()

  if (error || !data) throw new Error(error?.message ?? "Failed to create team")
  revalidatePath("/teams")
  return data.id as string
}

export async function updateTeam(id: string, input: TeamInput) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from("teams")
    .update({
      name: input.name,
      description: input.description,
      leader_id: input.leaderId,
      color_tag: input.colorTag,
      icon: input.icon,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/teams")
  revalidatePath(`/teams/${id}`)
}

export async function deleteTeam(id: string) {
  const supabase = await requireUser()
  const { error } = await supabase.from("teams").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/teams")
}

export async function addTeamMember(teamId: string, memberId: string) {
  const supabase = await requireUser()
  const { error } = await supabase.from("team_members").insert({ team_id: teamId, member_id: memberId })
  if (error) throw new Error(error.message)
  revalidatePath(`/teams/${teamId}`)
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("member_id", memberId)
  if (error) throw new Error(error.message)
  revalidatePath(`/teams/${teamId}`)
}

export async function updateMemberProfile(
  id: string,
  input: { fullName: string; seat: string | null; license: boolean },
) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from("members")
    .update({ full_name: input.fullName, seat: input.seat, license: input.license })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/teams")
}
