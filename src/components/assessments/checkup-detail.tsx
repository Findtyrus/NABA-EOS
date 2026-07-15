"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, Activity, CalendarPlus, CalendarX, ClipboardList, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { TakeAssessmentModal } from "@/components/assessments/take-assessment-modal"
import type { AssessmentConfig } from "@/lib/assessments-shared"
import { categoryAverages } from "@/lib/assessments-shared"
import type { Checkup, Response } from "@/lib/data/assessments"

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType
  value: React.ReactNode
  label: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border p-5 text-center">
      <Icon className="size-5 text-muted-foreground" />
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function CheckupDetail({
  config,
  checkup,
  title,
  myResponse,
  allResponses,
  memberCount,
}: {
  config: AssessmentConfig
  checkup: Checkup
  title: string
  myResponse: Response | null
  allResponses: Response[]
  memberCount: number
}) {
  const [tab, setTab] = useState<"mine" | "org">("mine")
  const responseRate = memberCount > 0 ? `${Math.round((allResponses.length / memberCount) * 100)}%` : "N/A"
  const averages = categoryAverages(config, allResponses)

  return (
    <div className="flex-1 p-6">
      <p className="text-sm">
        <Link href={`/assessments/${config.slug}`} className="text-accent hover:underline">
          {config.label}
        </Link>{" "}
        <span className="text-muted-foreground">&gt;</span> {title}
      </p>
      <h1 className="mb-4 mt-1 text-xl font-bold">{title}</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} value={allResponses.length} label="Responses" />
        <StatCard icon={Activity} value={responseRate} label="Response Rate" />
        <StatCard
          icon={CalendarPlus}
          value={new Date(`${checkup.survey_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          label="Created"
        />
        <StatCard
          icon={CalendarX}
          value={checkup.ends_at ? new Date(`${checkup.ends_at}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
          label="Ends"
        />
      </div>

      <div className="rounded-lg border">
        <div className="flex gap-2 border-b p-3">
          <button
            onClick={() => setTab("mine")}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-semibold",
              tab === "mine" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            My Response
          </button>
          <button
            onClick={() => setTab("org")}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-semibold",
              tab === "org" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            Organization Results
          </button>
        </div>

        <div className="p-6">
          {tab === "mine" ? (
            myResponse ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ClipboardList className="size-8 text-muted-foreground" />
                <p className="font-semibold">Response submitted</p>
                <p className="text-sm text-muted-foreground">
                  Submitted {new Date(myResponse.submitted_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ClipboardList className="size-8 text-muted-foreground" />
                <p className="font-semibold">No Response Yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {`Take the ${config.label.toLowerCase()} to see your individual results and contribute to your organization's understanding.`}
                </p>
                <TakeAssessmentModal
                  config={config}
                  checkupId={checkup.id}
                  title={title}
                  trigger={
                    <button className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                      <Play className="size-4" /> Take Assessment Now
                    </button>
                  }
                />
              </div>
            )
          ) : (
            <div className="space-y-4">
              {allResponses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No responses yet. Results will appear once members complete the assessment.
                </p>
              ) : (
                averages.map(({ category, average, count }) => (
                  <div key={category.name} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">
                        {category.emoji} {category.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold">{average ? average.toFixed(1) : "—"}</p>
                      <p className="text-xs text-muted-foreground">avg / 5 ({count} answers)</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
