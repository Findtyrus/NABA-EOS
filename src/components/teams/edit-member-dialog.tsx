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
import { Checkbox } from "@/components/ui/checkbox"
import type { Roster } from "@/lib/teams-shared"
import { updateMemberProfile } from "@/lib/actions/teams"

function EditMemberForm({ member, onClose }: { member: Roster; onClose: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState(member.full_name)
  const [seat, setSeat] = useState(member.seat ?? "")
  const [license, setLicense] = useState(member.license)

  function handleSave() {
    startTransition(async () => {
      await updateMemberProfile(member.id, { fullName, seat: seat || null, license })
      router.refresh()
      onClose()
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Member</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label htmlFor="member-name">Full Name</Label>
          <Input id="member-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="member-email">Email</Label>
          <Input id="member-email" value={member.email} disabled />
        </div>
        <div>
          <Label htmlFor="member-seat">Seat / Role</Label>
          <Input
            id="member-seat"
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            placeholder="e.g. VP of Membership"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="member-license"
            checked={license}
            onCheckedChange={(checked) => setLicense(checked === true)}
          />
          <Label htmlFor="member-license" className="font-normal">
            Licensed seat
          </Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-primary/90">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function EditMemberDialog({
  member,
  onClose,
}: {
  member: Roster | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {member && <EditMemberForm key={member.id} member={member} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
