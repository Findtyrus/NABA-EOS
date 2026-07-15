import Link from "next/link"
import { Target } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VtoEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-lg border p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent/10">
          <Target className="size-6 text-accent-foreground" />
        </div>
        <h2 className="text-lg font-bold">Build your Vision/Traction Organizer</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The V/TO captures where your chapter is going and how it plans to get there.
        </p>
        <Button
          render={<Link href="/vto/edit" />}
          nativeButton={false}
          className="mt-6 bg-primary hover:bg-primary/90"
        >
          Start Building Your V/TO
        </Button>
      </div>
    </div>
  )
}
