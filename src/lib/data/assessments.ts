import { createClient } from "@/lib/supabase/server"
import type { AssessmentTypeId } from "@/lib/assessments-shared"

export type Checkup = {
  id: string
  type: AssessmentTypeId
  survey_date: string
  ends_at: string | null
  created_at: string
}

export type Response = {
  id: string
  checkup_id: string
  member_id: string
  answers: Record<string, number>
  submitted_at: string
}

export async function getCurrentMemberId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getCheckups(type: AssessmentTypeId): Promise<Checkup[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("assessment_checkups")
    .select("id, type, survey_date, ends_at, created_at")
    .eq("type", type)
    .order("survey_date", { ascending: false })
  return (data ?? []) as Checkup[]
}

export async function getCheckup(id: string): Promise<Checkup | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("assessment_checkups")
    .select("id, type, survey_date, ends_at, created_at")
    .eq("id", id)
    .single()
  return data as Checkup | null
}

export async function getResponses(checkupId: string): Promise<Response[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("assessment_responses")
    .select("id, checkup_id, member_id, answers, submitted_at")
    .eq("checkup_id", checkupId)
  return (data ?? []) as Response[]
}

export async function getMyResponse(checkupId: string, memberId: string): Promise<Response | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("assessment_responses")
    .select("id, checkup_id, member_id, answers, submitted_at")
    .eq("checkup_id", checkupId)
    .eq("member_id", memberId)
    .maybeSingle()
  return data as Response | null
}

export async function getMemberCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
  return count ?? 0
}
