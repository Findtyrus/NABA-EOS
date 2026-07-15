import { createClient } from "@/lib/supabase/server"

export type RockRow = {
  id: string
  rock: string
  due_date: string | null
  status: string
  owner: { full_name: string } | null
}

export type IssueRow = {
  id: string
  issue: string
  status: string
  created_at: string
  owner: { full_name: string } | null
}

export type TodoRow = {
  id: string
  todo: string
  due_date: string | null
  completed: boolean
  meeting_id: string | null
  owner: { full_name: string } | null
}

export type HeadlineRow = {
  id: string
  headline: string
  status: string
  created_at: string
  meeting_id: string | null
  owner: { full_name: string } | null
}

export type ScorecardRow = {
  id: string
  metric: string
  target: string | null
  current_value: string | null
  status: string
  owner: { full_name: string } | null
}

export type MeetingOption = { id: string; title: string }

export async function getInsightsData() {
  const supabase = await createClient()

  const [rocks, issues, todos, headlines, scorecard, meetings] = await Promise.all([
    supabase
      .from("rocks")
      .select("id, rock, due_date, status, owner:members(full_name)")
      .order("due_date", { ascending: true }),
    supabase
      .from("issues")
      .select("id, issue, status, created_at, owner:members(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("todos")
      .select("id, todo, due_date, completed, meeting_id, owner:members(full_name)")
      .order("due_date", { ascending: true }),
    supabase
      .from("headlines")
      .select("id, headline, status, created_at, meeting_id, owner:members(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("scorecard")
      .select("id, metric, target, current_value, status, owner:members(full_name)")
      .order("metric", { ascending: true }),
    supabase.from("meetings").select("id, title").order("meeting_date", { ascending: false }),
  ])

  return {
    rocks: (rocks.data ?? []) as unknown as RockRow[],
    issues: (issues.data ?? []) as unknown as IssueRow[],
    todos: (todos.data ?? []) as unknown as TodoRow[],
    headlines: (headlines.data ?? []) as unknown as HeadlineRow[],
    scorecard: (scorecard.data ?? []) as unknown as ScorecardRow[],
    meetings: (meetings.data ?? []) as MeetingOption[],
  }
}

export function countOffTrackRocks(rocks: RockRow[]) {
  return rocks.filter((r) => r.status === "Off Track").length
}

export function countOverdueTodos(todos: TodoRow[]) {
  const today = new Date().toISOString().slice(0, 10)
  return todos.filter((t) => !t.completed && t.due_date && t.due_date < today).length
}

export function countUnresolvedIssues(issues: IssueRow[]) {
  return issues.filter((i) => i.status !== "Solved").length
}

export function countOffTrackMeasurables(scorecard: ScorecardRow[]) {
  return scorecard.filter((s) => s.status === "Off").length
}
