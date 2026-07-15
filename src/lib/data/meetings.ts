import { createClient } from "@/lib/supabase/server"
import type { Meeting, MemberOption } from "@/lib/meetings-shared"

export async function getCurrentMemberId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getMembers(): Promise<MemberOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("members")
    .select("id, full_name, email, license")
    .order("full_name", { ascending: true })
  return data ?? []
}

const MEETING_SELECT =
  "id, title, meeting_type, duration_minutes, meeting_date, start_time, recurrence, notes, created_by, meeting_attendees(member_id, role, members(id, full_name, email, license)), meeting_agenda_items(id, label, duration_minutes, sort_order)"

export async function getAllMeetings(): Promise<Meeting[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("meetings")
    .select(MEETING_SELECT)
    .order("meeting_date", { ascending: true })
  return (data ?? []) as unknown as Meeting[]
}

export async function getMyMeetings(memberId: string): Promise<Meeting[]> {
  const all = await getAllMeetings()
  return all.filter(
    (m) =>
      m.created_by === memberId ||
      m.meeting_attendees.some((a) => a.member_id === memberId),
  )
}
