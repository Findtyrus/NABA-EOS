"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, StickyNote } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Todo } from "@/lib/data/dashboard"

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return "—"
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function TodoRow({ todo }: { todo: Todo }) {
  const router = useRouter()
  const [completed, setCompleted] = useState(todo.completed)
  const [isPending, startTransition] = useTransition()

  function toggle(checked: boolean) {
    setCompleted(checked)
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from("todos").update({ completed: checked }).eq("id", todo.id)
      router.refresh()
    })
  }

  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/50">
      <td className="w-8 py-3 pl-4">
        <Checkbox
          checked={completed}
          disabled={isPending}
          onCheckedChange={(checked) => toggle(checked)}
        />
      </td>
      <td className="py-3 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={completed ? "text-muted-foreground line-through" : ""}>
            {todo.todo}
          </span>
          {todo.action_label && todo.action_href && (
            <Button
              size="sm"
              className="h-7 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => router.push(todo.action_href!)}
            >
              {todo.action_label}
            </Button>
          )}
        </div>
      </td>
      <td className="w-10 py-3 text-center text-muted-foreground">
        {todo.notes && <StickyNote className="mx-auto size-4" />}
      </td>
      <td className="w-24 py-3 text-muted-foreground">{formatDueDate(todo.due_date)}</td>
      <td className="w-10 py-3 pr-4 text-right text-muted-foreground">
        <MoreVertical className="ml-auto size-4" />
      </td>
    </tr>
  )
}
