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
import { IconPicker } from "@/components/teams/icon-picker"
import { TEAM_COLORS, type Team } from "@/lib/teams-shared"
import type { MemberOption } from "@/lib/meetings-shared"
import { createTeam, updateTeam } from "@/lib/actions/teams"

type TeamDialogState = { mode: "create" } | { mode: "edit"; team: Team }

function TeamForm({
  state,
  members,
  onClose,
}: {
  state: TeamDialogState
  members: MemberOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(state.mode === "edit" ? state.team.name : "")
  const [description, setDescription] = useState(
    state.mode === "edit" ? state.team.description ?? "" : "",
  )
  const [leaderId, setLeaderId] = useState(
    state.mode === "edit" ? state.team.leader_id ?? "none" : "none",
  )
  const [colorTag, setColorTag] = useState(
    state.mode === "edit" ? state.team.color_tag ?? "none" : "none",
  )
  const [icon, setIcon] = useState<string | null>(
    state.mode === "edit" ? state.team.icon : null,
  )

  function handleSave() {
    if (!name.trim()) return
    const input = {
      name,
      description: description || null,
      leaderId: leaderId === "none" ? null : leaderId,
      colorTag: colorTag === "none" ? null : colorTag,
      icon,
    }
    startTransition(async () => {
      if (state.mode === "create") {
        const id = await createTeam(input)
        router.push(`/teams/${id}`)
      } else {
        await updateTeam(state.team.id, input)
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{state.mode === "edit" ? "Edit Team" : "Create New Team"}</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="team-name">
            Team Name <span className="text-destructive">*</span>
          </Label>
          <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter team name" />
        </div>
        <div>
          <Label>Team Leader</Label>
          <Select value={leaderId} onValueChange={(v: string | null) => setLeaderId(v ?? "none")}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => members.find((m) => m.id === v)?.full_name ?? "No Leader"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Leader</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="team-description">Team Description</Label>
        <Textarea
          id="team-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter team description"
        />
      </div>

      <div>
        <Label>Color Tag</Label>
        <Select value={colorTag} onValueChange={(v: string | null) => setColorTag(v ?? "none")}>
          <SelectTrigger className="w-48">
            <SelectValue>
              {(v: string) => TEAM_COLORS.find((c) => c.key === v)?.label ?? "None"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {TEAM_COLORS.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                <span className="mr-1.5 inline-block size-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Team Icon</Label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !name.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          {isPending ? "Saving..." : state.mode === "edit" ? "Save Changes" : "Create Team"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function TeamDialog({
  state,
  members,
  onClose,
}: {
  state: TeamDialogState | null
  members: MemberOption[]
  onClose: () => void
}) {
  const dialogKey = state ? (state.mode === "edit" ? `edit-${state.team.id}` : "create") : "closed"

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {state && <TeamForm key={dialogKey} state={state} members={members} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
