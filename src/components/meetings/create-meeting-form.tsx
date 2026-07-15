"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Trash2, CalendarClock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { agendaIcon } from "@/components/meetings/agenda-icon"
import { MEETING_TYPES, type MeetingTypeId, type MemberOption } from "@/lib/meetings-shared"
import { createMeeting } from "@/lib/actions/meetings"

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180]

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const hours = Math.floor(min / 60)
  const rem = min % 60
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`
}

function compactTime(time: string) {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour12}${period}` : `${hour12}:${m.toString().padStart(2, "0")}${period}`
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function defaultMeetingDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function CreateMeetingForm({
  members,
  currentMemberId,
}: {
  members: MemberOption[]
  currentMemberId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [meetingType, setMeetingType] = useState<MeetingTypeId>("weekly")
  const [title, setTitle] = useState(
    MEETING_TYPES.find((t) => t.id === "weekly")!.label,
  )
  const [titleTouched, setTitleTouched] = useState(false)
  const [attendeeIds, setAttendeeIds] = useState<string[]>([])
  const [meetingDate, setMeetingDate] = useState(defaultMeetingDate())
  const [startTime, setStartTime] = useState("09:00")
  const [repeats, setRepeats] = useState(true)
  const [agenda, setAgenda] = useState(
    MEETING_TYPES.find((t) => t.id === "weekly")!.defaultAgenda,
  )

  const currentMember = members.find((m) => m.id === currentMemberId)
  const addedAttendees = members.filter((m) => attendeeIds.includes(m.id))
  const availableToAdd = members.filter(
    (m) => m.id !== currentMemberId && !attendeeIds.includes(m.id),
  )

  function selectType(typeId: MeetingTypeId) {
    const type = MEETING_TYPES.find((t) => t.id === typeId)!
    setMeetingType(typeId)
    setAgenda(type.defaultAgenda)
    if (!titleTouched) setTitle(type.label)
  }

  function updateAgendaLabel(index: number, label: string) {
    setAgenda((prev) => prev.map((item, i) => (i === index ? { ...item, label } : item)))
  }

  function updateAgendaDuration(index: number, durationMinutes: number) {
    setAgenda((prev) =>
      prev.map((item, i) => (i === index ? { ...item, durationMinutes } : item)),
    )
  }

  function removeAgendaItem(index: number) {
    setAgenda((prev) => prev.filter((_, i) => i !== index))
  }

  function moveAgendaItem(index: number, direction: -1 | 1) {
    setAgenda((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function addSection() {
    setAgenda((prev) => [...prev, { label: "New Section", durationMinutes: 5 }])
  }

  const totalMinutes = useMemo(
    () => agenda.reduce((sum, item) => sum + item.durationMinutes, 0),
    [agenda],
  )

  const weekdayName = new Date(`${meetingDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  })
  const monthDay = new Date(`${meetingDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })

  const scheduleSummary = repeats
    ? `${weekdayName}s at ${compactTime(startTime)} starting ${monthDay}`
    : `${weekdayName}, ${monthDay} at ${compactTime(startTime)}`

  function handleSubmit() {
    startTransition(async () => {
      await createMeeting({
        title: title.trim() || MEETING_TYPES.find((t) => t.id === meetingType)!.label,
        meetingType,
        durationMinutes: totalMinutes,
        meetingDate,
        startTime,
        recurrence: repeats ? "weekly" : null,
        attendeeIds,
        agendaItems: agenda,
      })
    })
  }

  return (
    <div className="grid flex-1 grid-cols-1 gap-8 p-6 lg:grid-cols-2">
      <div className="space-y-6">
        <button
          onClick={() => router.push("/meetings")}
          className="flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
        >
          <ChevronDown className="size-4 rotate-90" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Create Meeting</h1>

        <div className="space-y-2">
          <Label>Meeting Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {MEETING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => selectType(type.id)}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-colors",
                  meetingType === type.id
                    ? "border-primary"
                    : "border-border hover:border-muted-foreground/40",
                )}
              >
                <p className="text-sm font-semibold">{type.label}</p>
                <p className="text-sm text-muted-foreground">
                  {type.durationMinutes ? `${type.durationMinutes} minutes` : "Length TBD"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Attendees</Label>
          {availableToAdd.length > 0 && (
            <Select
              onValueChange={(id: string | null) =>
                id && setAttendeeIds((prev) => [...prev, id])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Attendee to Add" />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="space-y-2 pt-1">
            {currentMember && (
              <div className="flex items-center gap-3 rounded-md border p-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {initials(currentMember.full_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{currentMember.full_name}</span>
                    {currentMember.license && <Badge variant="outline">License</Badge>}
                    <Badge variant="outline">Meeting Owner</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{currentMember.email}</p>
                </div>
              </div>
            )}
            {addedAttendees.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-md border p-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {initials(m.full_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.full_name}</span>
                    {m.license && <Badge variant="outline">License</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <button
                  onClick={() => setAttendeeIds((prev) => prev.filter((id) => id !== m.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meeting-name">
            Meeting Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="meeting-name"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleTouched(true)
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>
            First Meeting &amp; Schedule <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-3">
            <Input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-36"
            />
          </div>
          <Select
            value={repeats ? "weekly" : "none"}
            onValueChange={(v) => setRepeats(v === "weekly")}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => (v === "weekly" ? `Repeat every ${weekdayName}` : "Does not repeat")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Does not repeat</SelectItem>
              <SelectItem value="weekly">Repeat every {weekdayName}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">*Required Fields</p>
      </div>

      <div className="space-y-4 lg:border-l lg:pl-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <CalendarClock className="size-6 text-muted-foreground" />
          <h2 className="text-xl font-bold">{title || "Untitled Meeting"}</h2>
          <p className="text-sm font-medium text-accent">{scheduleSummary}</p>
        </div>

        <h3 className="text-center text-sm font-semibold text-muted-foreground">
          Agenda ({formatDuration(totalMinutes)})
        </h3>

        <div className="space-y-1">
          {agenda.map((item, index) => {
            const Icon = agendaIcon(item.label)
            const locked = item.label === "Conclude"
            return (
              <div key={index} className="flex items-center gap-3 py-1.5">
                <div className="flex flex-col text-muted-foreground">
                  <button
                    disabled={index === 0}
                    onClick={() => moveAgendaItem(index, -1)}
                    className="disabled:opacity-20"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    disabled={index === agenda.length - 1}
                    onClick={() => moveAgendaItem(index, 1)}
                    className="disabled:opacity-20"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  value={item.label}
                  onChange={(e) => updateAgendaLabel(index, e.target.value)}
                  className="h-8 flex-1 border-none px-1 text-sm font-semibold uppercase tracking-wide shadow-none focus-visible:ring-1"
                />
                <Select
                  value={String(item.durationMinutes)}
                  onValueChange={(v) => updateAgendaDuration(index, Number(v))}
                >
                  <SelectTrigger className="h-8 w-28 text-sm">
                    <SelectValue>{(v: string) => formatDuration(Number(v))}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((min) => (
                      <SelectItem key={min} value={String(min)}>
                        {formatDuration(min)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!locked && (
                  <button
                    onClick={() => removeAgendaItem(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={addSection}
          className="flex w-full items-center justify-center gap-1 py-2 text-sm font-semibold text-accent hover:underline"
        >
          <Plus className="size-4" />
          Add Section
        </button>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push("/meetings")}>
            Cancel
          </Button>
          <Button
            disabled={isPending || !title.trim() || !meetingDate}
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? "Creating..." : "Create Meeting"}
          </Button>
        </div>
      </div>
    </div>
  )
}
