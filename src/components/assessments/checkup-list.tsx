"use client"

import { useTransition } from "react"
import Link from "next/link"
import { ChevronRight, Calendar, User, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCheckup } from "@/lib/actions/assessments"
import type { AssessmentConfig } from "@/lib/assessments-shared"
import type { Checkup } from "@/lib/data/assessments"

export function CheckupList({
  config,
  checkups,
  responseCounts,
}: {
  config: AssessmentConfig
  checkups: Checkup[]
  responseCounts: Record<string, number>
}) {
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    startTransition(async () => {
      await createCheckup(config.id, config.slug)
    })
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{config.label}</h1>
        <Button disabled={isPending} onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          + Create {config.label}
        </Button>
      </div>

      {checkups.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          No {config.label.toLowerCase()}s yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {checkups.map((checkup) => {
            const count = responseCounts[checkup.id] ?? 0
            const title = `${config.label} ${new Date(`${checkup.survey_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            return (
              <Link
                key={checkup.id}
                href={`/assessments/${config.slug}/${checkup.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-semibold">{title}</p>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {checkup.survey_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="size-4" />
                      {count === 0 ? "No responses yet" : `${count} response${count === 1 ? "" : "s"}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <LineChart className="size-4" />
                      Survey Date: {checkup.survey_date}
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
