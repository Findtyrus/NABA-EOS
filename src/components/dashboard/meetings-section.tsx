import Link from "next/link"
import { CalendarPlus } from "lucide-react"
import { DashboardSection } from "@/components/dashboard/section"
import type { Meeting } from "@/lib/data/dashboard"

export function MeetingsSection({ meetings }: { meetings: Meeting[] }) {
  return (
    <DashboardSection
      title="MY MEETINGS"
      action={
        <Link
          href="/meetings/new"
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <CalendarPlus className="size-4" />
          Create Meeting
        </Link>
      }
    >
      {meetings.length === 0 ? (
        <div className="flex min-h-[80px] items-center justify-center rounded-md border bg-muted/40 text-sm text-muted-foreground">
          You have no meetings scheduled
        </div>
      ) : (
        <ul className="divide-y rounded-md border">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{meeting.title}</span>
              <span className="text-muted-foreground">
                {new Date(`${meeting.meeting_date}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}
