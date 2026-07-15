"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { seedDefaultChart } from "@/lib/actions/ac"

export function AcEmptyState() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function start() {
    startTransition(async () => {
      await seedDefaultChart()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-lg border p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent/10">
          <Network className="size-6 text-accent" />
        </div>
        <h2 className="text-lg font-bold">Build your Accountability Chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The A/C shows who owns what, so every seat has one clear owner.
        </p>
        <Button
          disabled={isPending}
          onClick={start}
          className="mt-6 bg-primary hover:bg-primary/90"
        >
          {isPending ? "Building..." : "Start Building Your A/C"}
        </Button>
      </div>
    </div>
  )
}
