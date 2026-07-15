"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { MeetingTypeId } from "@/lib/meetings-shared"

export type CreateMeetingInput = {
  title: string
  meetingType: MeetingTypeId
  durationMinutes: number
  meetingDate: string
  startTime: string
  recurrence: "weekly" | null
  attendeeIds: string[]
  agendaItems: { label: string; durationMinutes: number }[]
}

export async function createMeeting(input: CreateMeetingInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      title: input.title,
      meeting_type: input.meetingType,
      duration_minutes: input.durationMinutes,
      meeting_date: input.meetingDate,
      start_time: input.startTime,
      recurrence: input.recurrence,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error || !meeting) {
    throw new Error(error?.message ?? "Failed to create meeting")
  }

  const attendeeRows = Array.from(new Set([...input.attendeeIds, user.id])).map(
    (memberId) => ({
      meeting_id: meeting.id,
      member_id: memberId,
      role: memberId === user.id ? "owner" as const : "attendee" as const,
    }),
  )

  const agendaRows = input.agendaItems.map((item, index) => ({
    meeting_id: meeting.id,
    sort_order: index,
    label: item.label,
    duration_minutes: item.durationMinutes,
  }))

  const [{ error: attendeesError }, { error: agendaError }] = await Promise.all([
    supabase.from("meeting_attendees").insert(attendeeRows),
    agendaRows.length > 0
      ? supabase.from("meeting_agenda_items").insert(agendaRows)
      : Promise.resolve({ error: null }),
  ])

  if (attendeesError || agendaError) {
    throw new Error(attendeesError?.message ?? agendaError?.message)
  }

  redirect("/meetings")
}
