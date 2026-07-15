"use client"

import { Gem, Diamond, ClipboardCheck, LineChart, Megaphone } from "lucide-react"
import { InsightsSection } from "@/components/insights/insights-section"
import type {
  RockRow,
  IssueRow,
  TodoRow,
  HeadlineRow,
  ScorecardRow,
  MeetingOption,
} from "@/lib/data/insights"

export function InsightsSections({
  rocks,
  issues,
  todos,
  headlines,
  scorecard,
  meetings,
}: {
  rocks: RockRow[]
  issues: IssueRow[]
  todos: TodoRow[]
  headlines: HeadlineRow[]
  scorecard: ScorecardRow[]
  meetings: MeetingOption[]
}) {
  return (
    <>
      <InsightsSection
        icon={LineChart}
        title="Scorecard"
        rows={scorecard}
        searchPlaceholder="Search metrics..."
        getSearchText={(r) => r.metric}
        getDate={() => null}
        statusOptions={[
          { value: "On", label: "On Track" },
          { value: "Off", label: "Off Track" },
        ]}
        getStatus={(r) => r.status}
        columns={[
          { header: "Metric", render: (r) => r.metric },
          { header: "Owner", render: (r) => r.owner?.full_name ?? "—" },
          { header: "Target", render: (r) => r.target ?? "—" },
          { header: "Current", render: (r) => r.current_value ?? "—" },
          { header: "Status", render: (r) => r.status },
        ]}
        csvHeaders={["Metric", "Owner", "Target", "Current", "Status"]}
        getCsvRow={(r) => [r.metric, r.owner?.full_name ?? "", r.target ?? "", r.current_value ?? "", r.status]}
      />

      <InsightsSection
        icon={Gem}
        title="Rocks"
        rows={rocks}
        searchPlaceholder="Search rocks..."
        getSearchText={(r) => r.rock}
        getDate={(r) => r.due_date}
        statusOptions={[
          { value: "On Track", label: "On Track" },
          { value: "Off Track", label: "Off Track" },
          { value: "Done", label: "Done" },
        ]}
        getStatus={(r) => r.status}
        columns={[
          { header: "Rock", render: (r) => r.rock },
          { header: "Owner", render: (r) => r.owner?.full_name ?? "—" },
          { header: "Due Date", render: (r) => r.due_date ?? "—" },
          { header: "Status", render: (r) => r.status },
        ]}
        csvHeaders={["Rock", "Owner", "Due Date", "Status"]}
        getCsvRow={(r) => [r.rock, r.owner?.full_name ?? "", r.due_date ?? "", r.status]}
      />

      <InsightsSection
        icon={Diamond}
        title="Issues"
        rows={issues}
        searchPlaceholder="Search issues..."
        getSearchText={(r) => r.issue}
        getDate={(r) => r.created_at.slice(0, 10)}
        statusOptions={[
          { value: "Solved", label: "Solved" },
          { value: "Open", label: "Not Solved" },
        ]}
        getStatus={(r) => r.status}
        columns={[
          { header: "Issue", render: (r) => r.issue },
          { header: "Raised By", render: (r) => r.owner?.full_name ?? "—" },
          { header: "Status", render: (r) => (r.status === "Solved" ? "Solved" : "Not Solved") },
        ]}
        csvHeaders={["Issue", "Raised By", "Status"]}
        getCsvRow={(r) => [r.issue, r.owner?.full_name ?? "", r.status]}
      />

      <InsightsSection
        icon={ClipboardCheck}
        title="To-Dos"
        rows={todos}
        searchPlaceholder="Search todos..."
        getSearchText={(r) => r.todo}
        getDate={(r) => r.due_date}
        statusOptions={[
          { value: "Not Done", label: "Not Done" },
          { value: "Done", label: "Done" },
        ]}
        getStatus={(r) => (r.completed ? "Done" : "Not Done")}
        meetings={meetings}
        getMeetingId={(r) => r.meeting_id}
        columns={[
          { header: "To-Do", render: (r) => r.todo },
          { header: "Owner", render: (r) => r.owner?.full_name ?? "—" },
          { header: "Due Date", render: (r) => r.due_date ?? "—" },
          { header: "Status", render: (r) => (r.completed ? "Done" : "Not Done") },
        ]}
        csvHeaders={["To-Do", "Owner", "Due Date", "Status"]}
        getCsvRow={(r) => [r.todo, r.owner?.full_name ?? "", r.due_date ?? "", r.completed ? "Done" : "Not Done"]}
      />

      <InsightsSection
        icon={Megaphone}
        title="Headlines"
        rows={headlines}
        searchPlaceholder="Search headlines..."
        getSearchText={(r) => r.headline}
        getDate={(r) => r.created_at.slice(0, 10)}
        statusOptions={[
          { value: "to_review", label: "To Review" },
          { value: "reviewed", label: "Reviewed" },
        ]}
        getStatus={(r) => r.status}
        meetings={meetings}
        getMeetingId={(r) => r.meeting_id}
        columns={[
          { header: "Headline", render: (r) => r.headline },
          { header: "Submitted By", render: (r) => r.owner?.full_name ?? "—" },
          { header: "Status", render: (r) => (r.status === "to_review" ? "To Review" : "Reviewed") },
        ]}
        csvHeaders={["Headline", "Submitted By", "Status"]}
        getCsvRow={(r) => [r.headline, r.owner?.full_name ?? "", r.status]}
      />
    </>
  )
}
