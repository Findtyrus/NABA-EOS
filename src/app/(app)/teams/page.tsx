import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { TeamsView } from "@/components/teams/teams-view"
import { getTeams, getRoster, getCurrentMemberId, canInviteMembers } from "@/lib/data/teams"
import { getMembers } from "@/lib/data/meetings"

export default async function TeamsPage() {
  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const [teams, roster, members, canInvite] = await Promise.all([
    getTeams(),
    getRoster(),
    getMembers(),
    canInviteMembers(memberId),
  ])

  return (
    <>
      <AppHeader title="Teams" />
      <TeamsView teams={teams} roster={roster} members={members} canInvite={canInvite} />
    </>
  )
}
