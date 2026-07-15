import { Gem, Diamond, ClipboardCheck, LineChart } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/insights/kpi-card"
import { InsightsSections } from "@/components/insights/insights-sections"
import {
  getInsightsData,
  countOffTrackRocks,
  countOverdueTodos,
  countUnresolvedIssues,
  countOffTrackMeasurables,
} from "@/lib/data/insights"

const ORG_NAME = "NABA Mississippi State University Chapter"

export default async function InsightsPage() {
  const { rocks, issues, todos, headlines, scorecard, meetings } = await getInsightsData()

  return (
    <>
      <AppHeader title="Insights" />
      <div className="flex-1 space-y-1 p-6">
        <h1 className="mb-4 text-xl font-bold">{ORG_NAME} Insights</h1>

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Gem} label="Off-Track Rocks" value={countOffTrackRocks(rocks)} />
          <KpiCard icon={ClipboardCheck} label="Overdue To-Dos" value={countOverdueTodos(todos)} />
          <KpiCard icon={Diamond} label="Unresolved Issues" value={countUnresolvedIssues(issues)} />
          <KpiCard
            icon={LineChart}
            label="Off-Track Measurables"
            value={countOffTrackMeasurables(scorecard)}
          />
        </div>

        <InsightsSections
          rocks={rocks}
          issues={issues}
          todos={todos}
          headlines={headlines}
          scorecard={scorecard}
          meetings={meetings}
        />
      </div>
    </>
  )
}
