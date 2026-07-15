import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MeetingsView } from "@/components/meetings/meetings-view"
import { getAllMeetings, getMyMeetings, getCurrentMemberId } from "@/lib/data/meetings"

export default async function MeetingsPage() {
  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const [allMeetings, myMeetings] = await Promise.all([
    getAllMeetings(),
    getMyMeetings(memberId),
  ])

  return (
    <>
      <AppHeader title="Meetings" />
      <MeetingsView myMeetings={myMeetings} allMeetings={allMeetings} />
    </>
  )
}
