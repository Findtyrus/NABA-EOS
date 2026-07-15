export type CoreFocusType = "purpose" | "cause" | "passion"

export type CoreValue = { name: string; description: string }
export type Measurable = { metric: string; target: string }

export type VtoData = {
  id: number
  core_values: CoreValue[]
  core_focus_type: CoreFocusType
  purpose: string | null
  niche: string | null
  semester_target: string | null
  mkt_audience: string | null
  mkt_uniques: string[]
  mkt_process: string | null
  mkt_guarantee: string | null
  eoy_date: string | null
  eoy_membership_goal: number | null
  eoy_financial_goal: number | null
  eoy_measurables: Measurable[]
  eoy_picture: string[]
  next_year_date: string | null
  next_year_membership_goal: number | null
  next_year_financial_goal: number | null
  next_year_goals: string[]
}

export type RockDraft = { rock: string; owner_id: string | null; due_date: string | null }
export type IssueDraft = { issue: string; raised_by: string | null }

export const WIZARD_STEPS = [
  { id: "core_values", label: "Core Values", section: "vision" as const },
  { id: "core_focus", label: "Core Focus", section: "vision" as const },
  { id: "semester_target", label: "Semester Target", section: "vision" as const },
  { id: "marketing", label: "Marketing Strategy", section: "vision" as const },
  { id: "eoy_picture", label: "End-of-Year Picture", section: "vision" as const },
  { id: "next_year_plan", label: "Next-Year Plan", section: "traction" as const },
  { id: "rocks", label: "Rocks", section: "traction" as const },
  { id: "issues", label: "Issues", section: "traction" as const },
] as const

export function isVtoStarted(vto: VtoData) {
  return (
    vto.core_values.some((v) => v.name.trim().length > 0) ||
    !!vto.purpose ||
    !!vto.niche ||
    !!vto.semester_target
  )
}
