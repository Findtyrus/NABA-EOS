"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeamDialog } from "@/components/teams/team-dialog"
import { getTeamIcon, getTeamColor, type Team } from "@/lib/teams-shared"
import type { MemberOption } from "@/lib/meetings-shared"
import { deleteTeam, addTeamMember, removeTeamMember } from "@/lib/actions/teams"

export function TeamDetail({
  team,
  teamMembers,
  allMembers,
}: {
  team: Team
  teamMembers: MemberOption[]
  allMembers: MemberOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const Icon = getTeamIcon(team.icon)
  const color = getTeamColor(team.color_tag)

  const availableToAdd = allMembers.filter((m) => !teamMembers.some((tm) => tm.id === m.id))

  function handleDelete() {
    if (!confirm(`Delete "${team.name}"? This won't delete any members.`)) return
    startTransition(async () => {
      await deleteTeam(team.id)
      router.push("/teams")
    })
  }

  function handleAdd(memberId: string) {
    startTransition(async () => {
      await addTeamMember(team.id, memberId)
      router.refresh()
    })
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      await removeTeamMember(team.id, memberId)
      router.refresh()
    })
  }

  return (
    <div className="flex-1 p-6">
      <p className="text-sm">
        <Link href="/teams" className="text-accent hover:underline">
          Teams
        </Link>{" "}
        <span className="text-muted-foreground">&gt;</span> {team.name}
      </p>

      <div className="mb-6 mt-2 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span
            className="flex size-14 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: color }}
          >
            {/* eslint-disable-next-line react-hooks/static-components -- stable reference from a static lookup table */}
            <Icon className="size-7" />
          </span>
          <div>
            <h1 className="text-xl font-bold">{team.name}</h1>
            {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}
            {team.leader && (
              <p className="text-xs text-muted-foreground">Led by {team.leader.full_name}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-sm font-bold tracking-wide">MEMBERS ({teamMembers.length})</h2>
          {availableToAdd.length > 0 && (
            <Select onValueChange={(v: string | null) => v && handleAdd(v)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Add a member...">
                  {() => (
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="size-4" /> Add a member
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {teamMembers.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No members on this team yet.</p>
        ) : (
          <ul className="divide-y">
            {teamMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{m.full_name}</p>
                  <p className="text-muted-foreground">{m.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TeamDialog
        state={editOpen ? { mode: "edit", team } : null}
        members={allMembers}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}
