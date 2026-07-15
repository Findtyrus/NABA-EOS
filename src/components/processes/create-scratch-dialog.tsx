"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProcessFromScratch } from "@/lib/actions/processes"

export function CreateScratchDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!name.trim()) return
    startTransition(async () => {
      await createProcessFromScratch({ processName: name, content })
      setOpen(false)
      setName("")
      setContent("")
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Process Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="process-name">Process Name</Label>
            <Input
              id="process-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Member Onboarding"
            />
          </div>
          <div>
            <Label htmlFor="process-content">Content</Label>
            <Textarea
              id="process-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write out the steps for this process..."
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? "Creating..." : "Create Process"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
