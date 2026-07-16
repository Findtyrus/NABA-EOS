"use client"

import { useState } from "react"
import Link from "next/link"
import { Users2, Plus, Pencil, Crown, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TeamDialog } from "@/components/teams/team-dialog"
import { EditMemberDialog } from "@/components/teams/edit-member-dialog"
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog"
import { getTeamIcon, getTeamColor, type Team, type Roster } from "@/lib/teams-shared"
import type { MemberOption } from "@/lib/meetings-shared"

type TeamWithCount = Team & { member_count: number }

function TeamCard({ team }: { team: TeamWithCount }) {
  const Icon = getTeamIcon(team.icon)
  const color = getTeamColor(team.color_tag)

  return (
    <Link
      href={`/teams/${team.id}`}
      className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-md text-white"
          style={{ backgroundColor: color }}
        >
          {/* eslint-disable-next-line react-hooks/static-components -- stable reference from a static lookup table */}
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{team.name}</p>
          <p className="text-xs text-muted-foreground">
            {team.member_count} member{team.member_count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      {team.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{team.description}</p>
      )}
      {team.leader && (
        <p className="text-xs text-muted-foreground">Led by {team.leader.full_name}</p>
      )}
    </Link>
  )
}

export function TeamsView({
  teams,
  roster,
  members,
  canInvite,
}: {
  teams: TeamWithCount[]
  roster: Roster[]
  members: MemberOption[]
  canInvite: boolean
}) {
  const [tab, setTab] = useState<"teams" | "people">("teams")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Roster | null>(null)

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">People &amp; Teams</h1>
        {tab === "teams" ? (
          <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4" /> Create Team
          </Button>
        ) : (
          canInvite && (
            <Button onClick={() => setInviteOpen(true)} className="bg-primary hover:bg-primary/90">
              <Mail className="size-4" /> Invite Member
            </Button>
          )
        )}
      </div>

      <div className="mb-4 flex gap-2 rounded-md border p-1 w-fit">
        <button
          onClick={() => setTab("teams")}
          className={cn(
            "rounded px-4 py-1.5 text-sm font-semibold",
            tab === "teams" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          Teams
        </button>
        <button
          onClick={() => setTab("people")}
          className={cn(
            "rounded px-4 py-1.5 text-sm font-semibold",
            tab === "people" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          People
        </button>
      </div>

      {tab === "teams" ? (
        teams.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <Users2 className="mx-auto mb-3 size-10 text-primary" />
            <p className="font-semibold">No teams found</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              You don&apos;t have any teams yet. Create your first team to get started with
              organizing your people and structure.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4 bg-primary hover:bg-primary/90">
              Create Your First Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Seat</th>
                <th className="px-4 py-2">License</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {roster.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      {m.full_name}
                      {m.is_owner && <Crown className="size-3.5 text-warning" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.seat ?? "—"}</td>
                  <td className="px-4 py-3">
                    {m.license ? (
                      <Badge variant="outline">Licensed</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingMember(m)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeamDialog
        state={dialogOpen ? { mode: "create" } : null}
        members={members}
        onClose={() => setDialogOpen(false)}
      />
      <EditMemberDialog member={editingMember} onClose={() => setEditingMember(null)} />
      <InviteMemberDialog open={inviteOpen} teams={teams} onClose={() => setInviteOpen(false)} />
    </div>
  )
}
