import { DashboardSection } from "@/components/dashboard/section"
import type { Scorecard } from "@/lib/data/dashboard"

export function MeasurablesSection({ scorecard }: { scorecard: Scorecard[] }) {
  return (
    <DashboardSection title="MY MEASURABLES" count={scorecard.length} defaultOpen={false}>
      {scorecard.length === 0 ? (
        <div className="flex min-h-[80px] items-center justify-center rounded-md border bg-muted/40 text-sm text-muted-foreground">
          You have no measurables
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <th className="py-2 pl-4">Metric</th>
                <th className="py-2">Target</th>
                <th className="py-2">Current</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {scorecard.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="py-3 pl-4">{row.metric}</td>
                  <td className="py-3 text-muted-foreground">{row.target ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{row.current_value ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardSection>
  )
}
