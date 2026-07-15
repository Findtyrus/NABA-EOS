"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { VtoData, RockDraft, IssueDraft } from "@/lib/vto-shared"

export type SaveVtoInput = Omit<VtoData, "id"> & {
  rocks: RockDraft[]
  issues: IssueDraft[]
}

export async function saveVtoFields(fields: Omit<VtoData, "id">) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("vto").update(fields).eq("id", 1)
  if (error) throw new Error(error.message)
}

export async function saveVto(input: SaveVtoInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { rocks, issues, ...vtoFields } = input

  const { error: vtoError } = await supabase
    .from("vto")
    .update(vtoFields)
    .eq("id", 1)

  if (vtoError) throw new Error(vtoError.message)

  const rockRows = rocks
    .filter((r) => r.rock.trim().length > 0)
    .map((r) => ({ rock: r.rock, owner_id: r.owner_id, due_date: r.due_date }))

  const issueRows = issues
    .filter((i) => i.issue.trim().length > 0)
    .map((i) => ({ issue: i.issue, raised_by: i.raised_by }))

  const [{ error: rocksError }, { error: issuesError }] = await Promise.all([
    rockRows.length > 0 ? supabase.from("rocks").insert(rockRows) : Promise.resolve({ error: null }),
    issueRows.length > 0 ? supabase.from("issues").insert(issueRows) : Promise.resolve({ error: null }),
  ])

  if (rocksError || issuesError) {
    throw new Error(rocksError?.message ?? issuesError?.message)
  }

  redirect("/vto")
}
