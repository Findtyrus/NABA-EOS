"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TEAM_ICONS } from "@/lib/teams-shared"

export function IconPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (key: string) => void
}) {
  const [search, setSearch] = useState("")
  const filtered = TEAM_ICONS.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        className="mb-3"
      />
      <div className="grid max-h-64 grid-cols-6 gap-2 overflow-y-auto">
        {filtered.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border p-2 text-xs hover:border-primary",
              value === key && "border-primary bg-primary text-primary-foreground",
            )}
          >
            <Icon className="size-5" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
