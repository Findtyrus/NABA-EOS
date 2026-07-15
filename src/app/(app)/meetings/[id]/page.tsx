import { notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { agendaIcon } from "@/components/meetings/agenda-icon"
import { createClient } from "@/lib/supabase/server"
import { nextOccurrence, type Meeting } from "@/lib/meetings-shared"

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const hours = Math.floor(min / 60)
  const rem = min % 60
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`
}

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("meetings")
    .select(
      "id, title, meeting_type, duration_minutes, meeting_date, start_time, recurrence, notes, created_by, meeting_attendees(member_id, role, members(id, full_name, email, license)), meeting_agenda_items(id, label, duration_minutes, sort_order)",
    )
    .eq("id", id)
    .single()

  if (!data) notFound()

  const meeting = data as unknown as Meeting
  const occurrence = nextOccurrence(meeting)
  const agenda = [...meeting.meeting_agenda_items].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <>
      <AppHeader title="Meetings" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-xl font-bold">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground">
            {occurrence
              ? occurrence.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "No upcoming occurrence"}{" "}
            &middot; {meeting.start_time.slice(0, 5)} &middot; {meeting.duration_minutes} min
            {meeting.recurrence === "weekly" && " · Repeats weekly"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border">
            <div className="border-b p-4 text-sm font-bold tracking-wide">ATTENDEES</div>
            <ul className="divide-y">
              {meeting.meeting_attendees.map((a) => (
                <li key={a.member_id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium">{a.members.full_name}</p>
                    <p className="text-muted-foreground">{a.members.email}</p>
                  </div>
                  {a.role === "owner" && <Badge variant="outline">Meeting Owner</Badge>}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border">
            <div className="border-b p-4 text-sm font-bold tracking-wide">
              AGENDA ({formatDuration(meeting.duration_minutes)})
            </div>
            <ul className="divide-y">
              {agenda.map((item) => {
                const Icon = agendaIcon(item.label)
                return (
                  <li key={item.id} className="flex items-center gap-3 p-4 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1 font-medium uppercase tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDuration(item.duration_minutes)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
