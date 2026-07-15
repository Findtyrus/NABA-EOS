export type MeetingTypeId = "weekly" | "planning" | "sync" | "custom"

export type MeetingType = {
  id: MeetingTypeId
  label: string
  durationMinutes: number | null
  defaultAgenda: { label: string; durationMinutes: number }[]
}

export const MEETING_TYPES: MeetingType[] = [
  {
    id: "weekly",
    label: "Weekly Leadership Meeting",
    durationMinutes: 90,
    defaultAgenda: [
      { label: "Segue", durationMinutes: 5 },
      { label: "Scorecard", durationMinutes: 5 },
      { label: "Rock Review", durationMinutes: 5 },
      { label: "Headlines", durationMinutes: 5 },
      { label: "To-Do List", durationMinutes: 5 },
      { label: "IDS", durationMinutes: 60 },
      { label: "Conclude", durationMinutes: 5 },
    ],
  },
  {
    id: "planning",
    label: "Planning Session",
    durationMinutes: 355,
    defaultAgenda: [
      { label: "Segue", durationMinutes: 10 },
      { label: "Review Prior Period", durationMinutes: 30 },
      { label: "Rock Setting", durationMinutes: 90 },
      { label: "Scorecard Review", durationMinutes: 30 },
      { label: "Org Checkup", durationMinutes: 30 },
      { label: "IDS", durationMinutes: 120 },
      { label: "To-Do List", durationMinutes: 15 },
      { label: "Conclude", durationMinutes: 30 },
    ],
  },
  {
    id: "sync",
    label: "Leadership Sync",
    durationMinutes: 120,
    defaultAgenda: [
      { label: "Segue", durationMinutes: 5 },
      { label: "Check-in", durationMinutes: 15 },
      { label: "Scorecard", durationMinutes: 10 },
      { label: "Rock Review", durationMinutes: 15 },
      { label: "IDS", durationMinutes: 55 },
      { label: "To-Do List", durationMinutes: 10 },
      { label: "Conclude", durationMinutes: 10 },
    ],
  },
  {
    id: "custom",
    label: "Custom Agenda",
    durationMinutes: null,
    defaultAgenda: [],
  },
]

export type MemberOption = {
  id: string
  full_name: string
  email: string
  license: boolean
}

export type MeetingAttendee = {
  member_id: string
  role: "owner" | "attendee"
  members: MemberOption
}

export type Meeting = {
  id: string
  title: string
  meeting_type: MeetingTypeId
  duration_minutes: number
  meeting_date: string
  start_time: string
  recurrence: "weekly" | null
  notes: string | null
  created_by: string | null
  meeting_attendees: MeetingAttendee[]
  meeting_agenda_items: { id: string; label: string; duration_minutes: number; sort_order: number }[]
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function nextOccurrence(meeting: Meeting): Date | null {
  const today = startOfDay(new Date())
  const base = startOfDay(new Date(`${meeting.meeting_date}T00:00:00`))

  if (meeting.recurrence === "weekly") {
    const cursor = new Date(base)
    while (cursor < today) {
      cursor.setDate(cursor.getDate() + 7)
    }
    return cursor
  }

  return base >= today ? base : null
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
