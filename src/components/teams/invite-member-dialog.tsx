"use client"

import { useState, useTransition } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sendInvite } from "@/lib/actions/invites"
import type { Team } from "@/lib/teams-shared"

export function InviteMemberDialog({
  open,
  teams,
  onClose,
}: {
  open: boolean
  teams: Team[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [teamId, setTeamId] = useState("none")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function reset() {
    setEmail("")
    setTeamId("none")
    setError(null)
    setSent(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSend() {
    if (!email.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await sendInvite(email.trim(), teamId === "none" ? null : teamId)
        setSent(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send invite")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-2">
            <p className="text-sm">
              Invite sent to <span className="font-medium">{email}</span>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="invite-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <Label>Add to Team</Label>
              <Select value={teamId} onValueChange={(v: string | null) => setTeamId(v ?? "none")}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) => teams.find((t) => t.id === v)?.name ?? "No Team"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {sent ? "Close" : "Cancel"}
          </Button>
          {!sent && (
            <Button
              onClick={handleSend}
              disabled={isPending || !email.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? "Sending..." : "Send Invite"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
