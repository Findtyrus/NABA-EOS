"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WIZARD_STEPS, type VtoData, type CoreFocusType } from "@/lib/vto-shared"
import type { MemberOption } from "@/lib/meetings-shared"
import { saveVto } from "@/lib/actions/vto"

type RockDraftRow = { rock: string; owner_id: string | null; due_date: string | null }
type IssueDraftRow = { issue: string; raised_by: string | null }

export function VtoWizard({
  initialVto,
  members,
}: {
  initialVto: VtoData
  members: MemberOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [stepIndex, setStepIndex] = useState(0)
  const [vto, setVto] = useState<VtoData>(initialVto)
  const [rocks, setRocks] = useState<RockDraftRow[]>([
    { rock: "", owner_id: null, due_date: null },
    { rock: "", owner_id: null, due_date: null },
    { rock: "", owner_id: null, due_date: null },
  ])
  const [issues, setIssues] = useState<IssueDraftRow[]>([
    { issue: "", raised_by: null },
    { issue: "", raised_by: null },
    { issue: "", raised_by: null },
  ])

  const step = WIZARD_STEPS[stepIndex]
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1
  const visionCount = WIZARD_STEPS.filter((s) => s.section === "vision").length

  function update<K extends keyof VtoData>(key: K, value: VtoData[K]) {
    setVto((prev) => ({ ...prev, [key]: value }))
  }

  function goNext() {
    if (isLastStep) {
      startTransition(async () => {
        const { id, ...fields } = vto
        void id
        await saveVto({ ...fields, rocks, issues })
      })
      return
    }
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1))
  }

  function goBack() {
    if (stepIndex === 0) {
      router.push("/vto")
      return
    }
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted-foreground">
          Step {stepIndex + 1} of {WIZARD_STEPS.length} &middot; {step.label}
        </p>
        <div className="mt-2 flex gap-1">
          {WIZARD_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= stepIndex ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <div className="mt-1 flex text-xs font-medium text-muted-foreground">
          <span style={{ flex: visionCount }}>Vision</span>
          <span style={{ flex: WIZARD_STEPS.length - visionCount }}>Traction</span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-3 border-r pr-4">
          {WIZARD_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStepIndex(i)}
              className={cn(
                "block w-full border-b pb-3 text-left text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground",
                i === stepIndex && "text-accent-foreground",
              )}
            >
              {i + 1} OF {WIZARD_STEPS.length} &middot; {s.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="max-w-2xl rounded-lg border p-6">
          {step.id === "core_values" && <CoreValuesStep vto={vto} update={update} />}
          {step.id === "core_focus" && <CoreFocusStep vto={vto} update={update} />}
          {step.id === "semester_target" && <SemesterTargetStep vto={vto} update={update} />}
          {step.id === "marketing" && <MarketingStep vto={vto} update={update} />}
          {step.id === "eoy_picture" && <EoyPictureStep vto={vto} update={update} />}
          {step.id === "next_year_plan" && <NextYearPlanStep vto={vto} update={update} />}
          {step.id === "rocks" && (
            <RocksStep rocks={rocks} setRocks={setRocks} members={members} />
          )}
          {step.id === "issues" && (
            <IssuesStep issues={issues} setIssues={setIssues} members={members} />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button
          disabled={isPending}
          onClick={goNext}
          className="bg-primary hover:bg-primary/90"
        >
          {isLastStep ? (isPending ? "Saving..." : "Finish Setup") : "Next"}
        </Button>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-sm font-semibold">{children}</p>
}

function CoreValuesStep({
  vto,
  update,
}: {
  vto: VtoData
  update: <K extends keyof VtoData>(key: K, value: VtoData[K]) => void
}) {
  function set(index: number, field: "name" | "description", value: string) {
    const next = [...vto.core_values]
    next[index] = { ...next[index], [field]: value }
    update("core_values", next)
  }
  function remove(index: number) {
    update(
      "core_values",
      vto.core_values.filter((_, i) => i !== index),
    )
  }
  function add() {
    update("core_values", [...vto.core_values, { name: "", description: "" }])
  }

  return (
    <div>
      <h2 className="text-lg font-bold">Core Values</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Define 3-7 timeless guiding principles that define who you are and how you operate.
      </p>
      <div className="space-y-3">
        {vto.core_values.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2 w-6 text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 space-y-2">
              <Input
                value={v.name}
                placeholder="Core value name"
                onChange={(e) => set(i, "name", e.target.value)}
              />
              <Input
                value={v.description}
                placeholder="What this looks like in practice"
                onChange={(e) => set(i, "description", e.target.value)}
              />
            </div>
            <button onClick={() => remove(i)} className="mt-2 text-muted-foreground hover:text-destructive">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline">
        <Plus className="size-4" /> Add Core Value
      </button>
    </div>
  )
}

function CoreFocusStep({
  vto,
  update,
}: {
  vto: VtoData
  update: <K extends keyof VtoData>(key: K, value: VtoData[K]) => void
}) {
  const types: CoreFocusType[] = ["purpose", "cause", "passion"]
  return (
    <div>
      <h2 className="text-lg font-bold">Core Focus</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Name the chapter&apos;s purpose (why you exist) and your niche (what you do better than anyone).
      </p>
      <div className="mb-2 flex gap-1 rounded-md border p-1 w-fit">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => update("core_focus_type", t)}
            className={cn(
              "rounded px-3 py-1 text-sm font-medium capitalize",
              vto.core_focus_type === t
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <Textarea
        value={vto.purpose ?? ""}
        onChange={(e) => update("purpose", e.target.value)}
        placeholder="Why does the chapter exist?"
        className="mb-4"
      />
      <FieldLabel>Niche</FieldLabel>
      <Textarea
        value={vto.niche ?? ""}
        onChange={(e) => update("niche", e.target.value)}
        placeholder="What does the chapter do better than anyone else?"
      />
    </div>
  )
}

function SemesterTargetStep({
  vto,
  update,
}: {
  vto: VtoData
  update: <K extends keyof VtoData>(key: K, value: VtoData[K]) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">Semester Target</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        A single ambitious goal for this semester, big enough to pull every decision in one direction.
      </p>
      <Textarea
        value={vto.semester_target ?? ""}
        onChange={(e) => update("semester_target", e.target.value)}
        placeholder="Where will the chapter be by the end of this semester?"
        rows={5}
      />
    </div>
  )
}

function MarketingStep({
  vto,
  update,
}: {
  vto: VtoData
  update: <K extends keyof VtoData>(key: K, value: VtoData[K]) => void
}) {
  function setUnique(i: number, value: string) {
    const next = [...vto.mkt_uniques]
    next[i] = value
    update("mkt_uniques", next)
  }
  function removeUnique(i: number) {
    update("mkt_uniques", vto.mkt_uniques.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Marketing Strategy</h2>
        <p className="text-sm text-muted-foreground">
          Define your target audience, what makes you unique, your process, and your guarantee.
        </p>
      </div>
      <div>
        <FieldLabel>Target Market</FieldLabel>
        <Textarea
          value={vto.mkt_audience ?? ""}
          onChange={(e) => update("mkt_audience", e.target.value)}
          placeholder="Who is the chapter's ideal member?"
        />
      </div>
      <div>
        <FieldLabel>3 Uniques</FieldLabel>
        <div className="space-y-2">
          {vto.mkt_uniques.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <Input value={u} onChange={(e) => setUnique(i, e.target.value)} className="flex-1" />
              <button onClick={() => removeUnique(i)} className="text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => update("mkt_uniques", [...vto.mkt_uniques, ""])}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
        >
          <Plus className="size-4" /> Add Unique
        </button>
      </div>
      <div>
        <FieldLabel>Proven Process</FieldLabel>
        <Textarea
          value={vto.mkt_process ?? ""}
          onChange={(e) => update("mkt_process", e.target.value)}
          placeholder="How does the chapter consistently deliver?"
        />
      </div>
      <div>
        <FieldLabel>Guarantee</FieldLabel>
        <Textarea
          value={vto.mkt_guarantee ?? ""}
          onChange={(e) => update("mkt_guarantee", e.target.value)}
        />
      </div>
    </div>
  )
}

function EoyPictureStep({
  vto,
  update,
}: {
  vto: VtoData
  update: <K extends keyof VtoData>(key: K, value: VtoData[K]) => void
}) {
  function setMeasurable(i: number, field: "metric" | "target", value: string) {
    const next = [...vto.eoy_measurables]
    next[i] = { ...next[i], [field]: value }
    update("eoy_measurables", next)
  }
  function setPicture(i: number, value: string) {
    const next = [...vto.eoy_picture]
    next[i] = value
    update("eoy_picture", next)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">End-of-Year Picture</h2>
        <p className="text-sm text-muted-foreground">
          Set a date, the numbers you expect, and what the chapter looks like when everything&apos;s working.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>End of Year</FieldLabel>
          <Input type="date" value={vto.eoy_date ?? ""} onChange={(e) => update("eoy_date", e.target.value)} />
        </div>
        <div>
          <FieldLabel>Membership Goal</FieldLabel>
          <Input
            type="number"
            value={vto.eoy_membership_goal ?? ""}
            onChange={(e) => update("eoy_membership_goal", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <FieldLabel>Financial Goal</FieldLabel>
          <Input
            type="number"
            value={vto.eoy_financial_goal ?? ""}
            onChange={(e) => update("eoy_financial_goal", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>
      <div>
        <FieldLabel>Measurables</FieldLabel>
        <div className="space-y-2">
          {vto.eoy_measurables.map((m, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={m.metric}
                placeholder="A key metric"
                onChange={(e) => setMeasurable(i, "metric", e.target.value)}
                className="flex-1"
              />
              <Input
                value={m.target}
                placeholder="e.g. 100%, $5,000, 150"
                onChange={(e) => setMeasurable(i, "target", e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => update("eoy_measurables", [...vto.eoy_measurables, { metric: "", target: "" }])}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
        >
          <Plus className="size-4" /> Add Measurable
        </button>
      </div>
      <div>
        <FieldLabel>What does it look like?</FieldLabel>
        <div className="space-y-2">
          {vto.eoy_picture.map((p, i) => (
            <Textarea key={i} value={p} onChange={(e) => setPicture(i, e.target.value)} />
          ))}
        </div>
        <button
          onClick={() => update("eoy_picture", [...vto.eoy_picture, ""])}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
        >
          <Plus className="size-4" /> Add Statement
        </button>
      </div>
    </div>
  )
}

function NextYearPlanStep({
  vto,
  update,
}: {
  vto: VtoData
  update: <K extends keyof VtoData>(key: K, value: VtoData[K]) => void
}) {
  function setGoal(i: number, value: string) {
    const next = [...vto.next_year_goals]
    next[i] = value
    update("next_year_goals", next)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Next-Year Plan</h2>
        <p className="text-sm text-muted-foreground">
          Pick a date, set membership and financial targets, and define 3-7 goals to hit by then.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>Future Date</FieldLabel>
          <Input
            type="date"
            value={vto.next_year_date ?? ""}
            onChange={(e) => update("next_year_date", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Membership Goal</FieldLabel>
          <Input
            type="number"
            value={vto.next_year_membership_goal ?? ""}
            onChange={(e) =>
              update("next_year_membership_goal", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
        <div>
          <FieldLabel>Financial Goal</FieldLabel>
          <Input
            type="number"
            value={vto.next_year_financial_goal ?? ""}
            onChange={(e) =>
              update("next_year_financial_goal", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      </div>
      <div>
        <FieldLabel>Goals for the Year</FieldLabel>
        <div className="space-y-2">
          {vto.next_year_goals.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <Input value={g} onChange={(e) => setGoal(i, e.target.value)} className="flex-1" />
            </div>
          ))}
        </div>
        <button
          onClick={() => update("next_year_goals", [...vto.next_year_goals, ""])}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
        >
          <Plus className="size-4" /> Add Goal
        </button>
      </div>
    </div>
  )
}

function RocksStep({
  rocks,
  setRocks,
  members,
}: {
  rocks: RockDraftRow[]
  setRocks: React.Dispatch<React.SetStateAction<RockDraftRow[]>>
  members: MemberOption[]
}) {
  function set(i: number, field: keyof RockDraftRow, value: string | null) {
    setRocks((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  return (
    <div>
      <h2 className="text-lg font-bold">Rocks</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The 3-7 priorities that matter most this quarter, each with one owner and a due date.
      </p>
      <div className="space-y-3">
        {rocks.map((r, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <Input
                value={r.rock}
                placeholder="A priority the chapter must hit this quarter"
                onChange={(e) => set(i, "rock", e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="ml-8 flex gap-2">
              <Select
                value={r.owner_id ?? "none"}
                onValueChange={(v) => set(i, "owner_id", v === "none" ? null : v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue>
                    {(v: string) => members.find((m) => m.id === v)?.full_name ?? "No owner"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No owner</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={r.due_date ?? ""}
                onChange={(e) => set(i, "due_date", e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setRocks((prev) => [...prev, { rock: "", owner_id: null, due_date: null }])}
        className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
      >
        <Plus className="size-4" /> Add Rock
      </button>
    </div>
  )
}

function IssuesStep({
  issues,
  setIssues,
  members,
}: {
  issues: IssueDraftRow[]
  setIssues: React.Dispatch<React.SetStateAction<IssueDraftRow[]>>
  members: MemberOption[]
}) {
  function set(i: number, field: keyof IssueDraftRow, value: string | null) {
    setIssues((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }
  function remove(i: number) {
    setIssues((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <h2 className="text-lg font-bold">Issues</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Surface the questions, frictions, and conversations you&apos;ve been working around.
      </p>
      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <Input
                value={issue.issue}
                placeholder="An obstacle or open question the chapter needs to resolve"
                onChange={(e) => set(i, "issue", e.target.value)}
                className="flex-1"
              />
              <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </button>
            </div>
            <div className="ml-8">
              <Select
                value={issue.raised_by ?? "none"}
                onValueChange={(v) => set(i, "raised_by", v === "none" ? null : v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue>
                    {(v: string) => members.find((m) => m.id === v)?.full_name ?? "No owner"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No owner</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIssues((prev) => [...prev, { issue: "", raised_by: null }])}
        className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
      >
        <Plus className="size-4" /> Add Issue
      </button>
    </div>
  )
}
