import type { LucideIcon } from "lucide-react"

export function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center">
      <Icon className="size-6 text-muted-foreground" />
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  )
}
