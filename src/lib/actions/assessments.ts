"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { AssessmentTypeId } from "@/lib/assessments-shared"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return { supabase, user }
}

export async function createCheckup(type: AssessmentTypeId, slug: string) {
  const { supabase } = await requireUser()

  const surveyDate = new Date().toISOString().slice(0, 10)
  const endsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("assessment_checkups")
    .insert({ type, survey_date: surveyDate, ends_at: endsAt })
    .select("id")
    .single()

  if (error || !data) throw new Error(error?.message ?? "Failed to create checkup")

  revalidatePath(`/assessments/${slug}`)
  redirect(`/assessments/${slug}/${data.id}`)
}

export async function submitResponse(checkupId: string, answers: Record<string, number>) {
  const { supabase, user } = await requireUser()

  const { error } = await supabase.from("assessment_responses").upsert(
    { checkup_id: checkupId, member_id: user.id, answers },
    { onConflict: "checkup_id,member_id" },
  )

  if (error) throw new Error(error.message)
  revalidatePath("/assessments")
}
