"use client"

import { useState } from "react"
import { MoreVertical, Plus, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SeatDialog } from "@/components/ac/seat-dialog"
import { buildTree, isSeatIncomplete, type Seat, type SeatNode } from "@/lib/ac-shared"
import type { MemberOption } from "@/lib/meetings-shared"

type DialogState = { mode: "create"; parentId: string | null } | { mode: "edit"; seat: Seat }

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function SeatBox({
  node,
  onEdit,
  onAddChild,
}: {
  node: SeatNode
  onEdit: () => void
  onAddChild: () => void
}) {
  const incomplete = isSeatIncomplete(node)

  return (
    <div className="relative w-56 rounded-lg border-2 border-dashed border-border bg-card p-3 data-[incomplete=true]:border-primary/60" data-incomplete={incomplete}>
      <div className="flex items-start gap-3">
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {node.member ? initials(node.member.full_name) : "?"}
          {incomplete && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1.5">
          <p className="truncate text-sm font-medium">{node.seat}</p>
          {node.member && (
            <p className="truncate text-xs text-muted-foreground">{node.member.full_name}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" /> Edit Seat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddChild}>
              <Plus className="size-4" /> Add Direct Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function TreeNode({
  node,
  onEdit,
  onAddChild,
}: {
  node: SeatNode
  onEdit: (seat: Seat) => void
  onAddChild: (parentId: string) => void
}) {
  const hasChildren = node.children.length > 0
  const multipleChildren = node.children.length > 1

  return (
    <div className="flex flex-col items-center">
      <SeatBox node={node} onEdit={() => onEdit(node)} onAddChild={() => onAddChild(node.id)} />
      {hasChildren && (
        <>
          <div className="h-6 w-px bg-border" />
          <div
            className={cn(
              "flex w-fit gap-8",
              multipleChildren && "border-t border-border",
            )}
          >
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-6 w-px bg-border" />
                <TreeNode node={child} onEdit={onEdit} onAddChild={onAddChild} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function AcChart({ seats, members }: { seats: Seat[]; members: MemberOption[] }) {
  const tree = buildTree(seats)
  const [dialogState, setDialogState] = useState<DialogState | null>(null)

  return (
    <div className="flex flex-1 flex-col overflow-auto p-8">
      <div className="flex min-w-fit flex-1 justify-center gap-16">
        {tree.map((root) => (
          <TreeNode
            key={root.id}
            node={root}
            onEdit={(seat) => setDialogState({ mode: "edit", seat })}
            onAddChild={(parentId) => setDialogState({ mode: "create", parentId })}
          />
        ))}
      </div>

      <SeatDialog state={dialogState} members={members} onClose={() => setDialogState(null)} />
    </div>
  )
}
