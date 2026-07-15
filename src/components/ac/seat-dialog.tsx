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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MemberOption } from "@/lib/meetings-shared"
import type { Seat } from "@/lib/ac-shared"
import { createSeat, updateSeat, deleteSeat } from "@/lib/actions/ac"

type SeatDialogState =
  | { mode: "create"; parentId: string | null }
  | { mode: "edit"; seat: Seat }

function SeatForm({
  state,
  members,
  onClose,
}: {
  state: SeatDialogState
  members: MemberOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [seatName, setSeatName] = useState(state.mode === "edit" ? state.seat.seat : "")
  const [memberId, setMemberId] = useState(
    state.mode === "edit" ? state.seat.member_id ?? "none" : "none",
  )
  const [duties, setDuties] = useState(state.mode === "edit" ? state.seat.duties ?? "" : "")

  function handleSave() {
    startTransition(async () => {
      if (state.mode === "create") {
        await createSeat({
          seat: seatName || "New Seat",
          parentId: state.parentId,
          memberId: memberId === "none" ? null : memberId,
          duties: duties || null,
        })
      } else {
        await updateSeat(state.seat.id, {
          seat: seatName || "New Seat",
          memberId: memberId === "none" ? null : memberId,
          duties: duties || null,
        })
      }
      router.refresh()
      onClose()
    })
  }

  function handleDelete() {
    if (state.mode !== "edit") return
    if (!confirm("Delete this seat? Any seats below it will also be removed.")) return
    startTransition(async () => {
      await deleteSeat(state.seat.id)
      router.refresh()
      onClose()
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{state.mode === "edit" ? "Edit Seat" : "Add Seat"}</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <div>
          <Label htmlFor="seat-name">Seat Name</Label>
          <Input id="seat-name" value={seatName} onChange={(e) => setSeatName(e.target.value)} />
        </div>
        <div>
          <Label>Owner</Label>
          <Select value={memberId} onValueChange={(v) => setMemberId(v ?? "none")}>
            <SelectTrigger className="w-full">
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
        <div>
          <Label htmlFor="seat-duties">Duties</Label>
          <Textarea
            id="seat-duties"
            value={duties}
            onChange={(e) => setDuties(e.target.value)}
            placeholder="What this seat is responsible for"
          />
        </div>
      </div>

      <DialogFooter>
        {state.mode === "edit" && (
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
            className="sm:mr-auto"
          >
            Delete
          </Button>
        )}
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-primary/90">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function SeatDialog({
  state,
  members,
  onClose,
}: {
  state: SeatDialogState | null
  members: MemberOption[]
  onClose: () => void
}) {
  const dialogKey = state
    ? state.mode === "edit"
      ? `edit-${state.seat.id}`
      : `create-${state.parentId}`
    : "closed"

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {state && <SeatForm key={dialogKey} state={state} members={members} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
