"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendInviteEmail } from "@/lib/resend"

async function requireInviter() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, is_owner")
    .eq("id", user.id)
    .single()
  if (!member) throw new Error("Member profile not found")

  if (!member.is_owner) {
    const { data: leadershipTeam } = await supabase
      .from("teams")
      .select("id")
      .ilike("name", "Leadership Team")
      .maybeSingle()

    const membership = leadershipTeam
      ? await supabase
          .from("team_members")
          .select("team_id")
          .eq("team_id", leadershipTeam.id)
          .eq("member_id", user.id)
          .maybeSingle()
      : null

    if (!membership?.data) {
      throw new Error("Only the chapter owner or Leadership Team members can invite people")
    }
  }

  return { supabase, member }
}

export async function sendInvite(email: string, teamId: string | null) {
  const { supabase, member } = await requireInviter()

  let teamName: string | null = null
  if (teamId) {
    const { data: team } = await supabase.from("teams").select("name").eq("id", teamId).single()
    teamName = team?.name ?? null
  }

  const { data: invite, error } = await supabase
    .from("invites")
    .insert({ email, team_id: teamId, invited_by: member.id })
    .select("token")
    .single()

  if (error || !invite) throw new Error(error?.message ?? "Failed to create invite")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const inviteUrl = `${baseUrl}/invite/${invite.token}`

  await sendInviteEmail({
    to: email,
    inviterName: member.full_name,
    teamName,
    inviteUrl,
  })

  revalidatePath("/teams")
}
