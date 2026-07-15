"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { nextOccurrence, isSameDay, type Meeting } from "@/lib/meetings-shared"

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`
}

function MeetingRow({ meeting }: { meeting: Meeting }) {
  const occurrence = nextOccurrence(meeting)
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
    >
      <div>
        <p className="font-medium">{meeting.title}</p>
        <p className="text-muted-foreground">
          {occurrence
            ? occurrence.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "—"}{" "}
          at {formatTime(meeting.start_time)}
          {meeting.recurrence === "weekly" && " · Weekly"}
        </p>
      </div>
      <span className="text-muted-foreground">{meeting.duration_minutes} min</span>
    </Link>
  )
}

export function MeetingsView({
  myMeetings,
  allMeetings,
}: {
  myMeetings: Meeting[]
  allMeetings: Meeting[]
}) {
  const [scope, setScope] = useState<"mine" | "all">("mine")
  const meetings = scope === "mine" ? myMeetings : allMeetings

  const today = useMemo(() => new Date(), [])
  const tomorrow = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d
  }, [today])

  const withOccurrence = meetings
    .map((m) => ({ meeting: m, occurrence: nextOccurrence(m) }))
    .filter((m): m is { meeting: Meeting; occurrence: Date } => m.occurrence !== null)
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())

  const todayMeetings = withOccurrence.filter((m) => isSameDay(m.occurrence, today))
  const tomorrowMeetings = withOccurrence.filter((m) => isSameDay(m.occurrence, tomorrow))

  const [day, setDay] = useState<"today" | "tomorrow">("today")
  const dayMeetings = day === "today" ? todayMeetings : tomorrowMeetings

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-md border p-1">
          <button
            onClick={() => setScope("mine")}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-semibold transition-colors",
              scope === "mine"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            My Meetings
          </button>
          <button
            onClick={() => setScope("all")}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-semibold transition-colors",
              scope === "all"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            All Meetings
          </button>
        </div>
        <Button
          render={<Link href="/meetings/new" />}
          nativeButton={false}
          className="bg-primary hover:bg-primary/90"
        >
          + Create Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h2 className="text-sm font-bold tracking-wide">UPCOMING MEETINGS</h2>
          </div>
          <div className="flex gap-2 p-3">
            <button
              onClick={() => setDay("today")}
              className={cn(
                "flex-1 rounded px-3 py-2 text-sm font-semibold transition-colors",
                day === "today"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground hover:bg-muted/70",
              )}
            >
              Today ({todayMeetings.length})
            </button>
            <button
              onClick={() => setDay("tomorrow")}
              className={cn(
                "flex-1 rounded px-3 py-2 text-sm font-semibold transition-colors",
                day === "tomorrow"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground hover:bg-muted/70",
              )}
            >
              Tomorrow ({tomorrowMeetings.length})
            </button>
          </div>
          {dayMeetings.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              You currently have no meetings {day}.
            </p>
          ) : (
            <ul className="divide-y border-t">
              {dayMeetings.map(({ meeting }) => (
                <li key={meeting.id}>
                  <MeetingRow meeting={meeting} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h2 className="text-sm font-bold tracking-wide">
              {scope === "mine" ? "ALL MY MEETINGS" : "ALL MEETINGS"} ({meetings.length})
            </h2>
          </div>
          {meetings.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No meetings yet.</p>
          ) : (
            <ul className="divide-y">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <MeetingRow meeting={meeting} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
