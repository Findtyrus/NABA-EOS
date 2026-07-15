import { redirect } from "next/navigation"
import { CreateMeetingForm } from "@/components/meetings/create-meeting-form"
import { getMembers, getCurrentMemberId } from "@/lib/data/meetings"

export default async function NewMeetingPage() {
  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const members = await getMembers()

  return <CreateMeetingForm members={members} currentMemberId={memberId} />
}
