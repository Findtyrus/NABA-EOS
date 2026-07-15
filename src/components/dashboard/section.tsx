"use client"

import { ChevronDown, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export function DashboardSection({
  title,
  icon: Icon,
  count,
  action,
  defaultOpen = true,
  children,
}: {
  title: string
  icon?: LucideIcon
  count?: number
  action?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          <h2 className="text-sm font-bold tracking-wide text-foreground">
            {title}
          </h2>
          {typeof count === "number" && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {action}
          <CollapsibleTrigger
            className={cn(
              "rounded p-1 text-muted-foreground hover:bg-muted",
              "group",
            )}
          >
            <ChevronDown className="size-4 transition-transform group-data-[panel-open]:rotate-180" />
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  )
}
