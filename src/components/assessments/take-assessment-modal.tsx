"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Play, Clock, ListChecks } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LIKERT_OPTIONS, type AssessmentConfig } from "@/lib/assessments-shared"
import { submitResponse } from "@/lib/actions/assessments"

export function TakeAssessmentModal({
  config,
  checkupId,
  title,
  trigger,
}: {
  config: AssessmentConfig
  checkupId: string
  title: string
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isPending, startTransition] = useTransition()

  const question = config.questions[step]
  const isLast = step === config.questions.length - 1
  const percent = Math.round(((step + 1) / config.questions.length) * 100)

  function reset() {
    setStarted(false)
    setStep(0)
    setAnswers({})
  }

  function selectAnswer(value: number) {
    const next = { ...answers, [question.id]: value }
    setAnswers(next)

    if (isLast) {
      startTransition(async () => {
        await submitResponse(checkupId, next)
        setOpen(false)
        reset()
        router.refresh()
      })
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{title}</DialogTitle>

        {!started ? (
          <div className="space-y-6 text-center">
            <div className="text-4xl">{config.categories[0]?.emoji}</div>
            <div>
              <h2 className="text-lg font-bold">Welcome to Your {config.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{config.intro}</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="mb-3 text-sm font-semibold">What to Expect</p>
              <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center gap-1">
                  <Clock className="size-5 text-primary" />
                  <p className="text-sm font-semibold">5-10 Minutes</p>
                  <p className="text-xs text-muted-foreground">Average completion time</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ListChecks className="size-5 text-primary" />
                  <p className="text-sm font-semibold">{config.questions.length} Questions</p>
                  <p className="text-xs text-muted-foreground">About your experience</p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Assessment Sections</p>
              <div className="grid grid-cols-2 gap-3">
                {config.categories.map((cat) => (
                  <div key={cat.name} className="rounded-lg border p-3 text-left">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <span>{cat.emoji}</span> {cat.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Your responses are confidential and will be aggregated with team results.
            </p>

            <Button onClick={() => setStarted(true)} className="w-full bg-primary hover:bg-primary/90">
              <Play className="size-4" /> Begin Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>
                  Question {step + 1} of {config.questions.length}
                </span>
                <span className="text-primary">{percent}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                {config.categories.find((c) => c.name === question.category)?.emoji} {question.category}
              </span>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                {step + 1} / {config.questions.length}
              </span>
            </div>

            <div>
              <p className="text-lg font-semibold">{question.text}</p>
              <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
            </div>

            <div>
              <p className="mb-2 text-sm text-muted-foreground">How much do you agree with this statement?</p>
              <div className="grid grid-cols-5 gap-2">
                {LIKERT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={isPending}
                    onClick={() => selectAnswer(opt.value)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-lg border text-2xl transition-colors hover:border-primary disabled:opacity-50",
                      answers[question.id] === opt.value && "border-primary bg-accent/10",
                    )}
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
