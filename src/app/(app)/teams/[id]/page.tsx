import { notFound, redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { TeamDetail } from "@/components/teams/team-detail"
import { getTeam, getTeamMemberIds, getCurrentMemberId } from "@/lib/data/teams"
import { getMembers } from "@/lib/data/meetings"

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const team = await getTeam(id)
  if (!team) notFound()

  const [memberIds, allMembers] = await Promise.all([getTeamMemberIds(id), getMembers()])
  const teamMembers = allMembers.filter((m) => memberIds.includes(m.id))

  return (
    <>
      <AppHeader title="Teams" />
      <TeamDetail team={team} teamMembers={teamMembers} allMembers={allMembers} />
    </>
  )
}
