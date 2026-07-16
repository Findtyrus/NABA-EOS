import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InviteSignupForm } from "@/components/invite-signup-form"

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc("get_invite", { p_token: token }).maybeSingle()
  const invite = data as { email: string; team_name: string | null; status: string } | null

  if (!invite) notFound()

  return (
    <InviteSignupForm
      email={invite.email}
      teamName={invite.team_name}
      alreadyAccepted={invite.status === "accepted"}
    />
  )
}
