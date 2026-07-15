import { DashboardSection } from "@/components/dashboard/section"
import { Badge } from "@/components/ui/badge"
import type { Rock } from "@/lib/data/dashboard"

function statusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "done":
    case "complete":
      return "bg-success-light text-success"
    case "off track":
    case "at risk":
      return "bg-danger-light text-destructive"
    default:
      return "bg-warning-light text-warning"
  }
}

export function RocksSection({ rocks }: { rocks: Rock[] }) {
  return (
    <DashboardSection title="MY ROCKS" count={rocks.length} defaultOpen={false}>
      {rocks.length === 0 ? (
        <div className="flex min-h-[80px] items-center justify-center rounded-md border bg-muted/40 text-sm text-muted-foreground">
          You have no rocks this period
        </div>
      ) : (
        <ul className="divide-y rounded-md border">
          {rocks.map((rock) => (
            <li key={rock.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{rock.rock}</span>
              <Badge className={statusVariant(rock.status)} variant="secondary">
                {rock.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}
