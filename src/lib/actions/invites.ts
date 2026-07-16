"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendInviteEmail } from "@/lib/resend"

type InviterResult =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; member: { id: string; full_name: string } }
  | { ok: false; error: string }

async function getInviter(): Promise<InviterResult> {
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
  if (!member) return { ok: false, error: "Member profile not found" }

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
      return { ok: false, error: "Only the chapter owner or Leadership Team members can invite people" }
    }
  }

  return { ok: true, supabase, member }
}

export async function sendInvite(
  email: string,
  teamId: string | null,
): Promise<{ error?: string }> {
  const inviter = await getInviter()
  if (!inviter.ok) return { error: inviter.error }
  const { supabase, member } = inviter

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

  if (error || !invite) return { error: error?.message ?? "Failed to create invite" }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const inviteUrl = `${baseUrl}/invite/${invite.token}`

  try {
    await sendInviteEmail({
      to: email,
      inviterName: member.full_name,
      teamName,
      inviteUrl,
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to send invite email" }
  }

  revalidatePath("/teams")
  return {}
}
