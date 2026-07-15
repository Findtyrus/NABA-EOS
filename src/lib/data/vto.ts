import { createClient } from "@/lib/supabase/server"
import type { VtoData } from "@/lib/vto-shared"

export async function getVto(): Promise<VtoData> {
  const supabase = await createClient()
  const { data } = await supabase.from("vto").select("*").eq("id", 1).single()

  return {
    id: 1,
    core_values: data?.core_values ?? [],
    core_focus_type: data?.core_focus_type ?? "purpose",
    purpose: data?.purpose ?? null,
    niche: data?.niche ?? null,
    semester_target: data?.semester_target ?? null,
    mkt_audience: data?.mkt_audience ?? null,
    mkt_uniques: data?.mkt_uniques ?? [],
    mkt_process: data?.mkt_process ?? null,
    mkt_guarantee: data?.mkt_guarantee ?? null,
    eoy_date: data?.eoy_date ?? null,
    eoy_membership_goal: data?.eoy_membership_goal ?? null,
    eoy_financial_goal: data?.eoy_financial_goal ?? null,
    eoy_measurables: data?.eoy_measurables ?? [],
    eoy_picture: data?.eoy_picture ?? [],
    next_year_date: data?.next_year_date ?? null,
    next_year_membership_goal: data?.next_year_membership_goal ?? null,
    next_year_financial_goal: data?.next_year_financial_goal ?? null,
    next_year_goals: data?.next_year_goals ?? [],
  }
}
