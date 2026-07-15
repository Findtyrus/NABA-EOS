"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CHART_SEATS } from "@/lib/ac-shared"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return supabase
}

export async function seedDefaultChart() {
  const supabase = await requireUser()

  const ids: string[] = []
  for (let i = 0; i < DEFAULT_CHART_SEATS.length; i++) {
    const def = DEFAULT_CHART_SEATS[i]
    const { data, error } = await supabase
      .from("accountability_chart")
      .insert({
        seat: def.seat,
        parent_id: def.parentIndex === null ? null : ids[def.parentIndex],
        sort_order: i,
      })
      .select("id")
      .single()

    if (error || !data) throw new Error(error?.message ?? "Failed to seed chart")
    ids.push(data.id)
  }

  revalidatePath("/ac")
}

export async function createSeat(input: {
  seat: string
  parentId: string | null
  memberId: string | null
  duties: string | null
}) {
  const supabase = await requireUser()

  const { count } = await supabase
    .from("accountability_chart")
    .select("id", { count: "exact", head: true })

  const { error } = await supabase.from("accountability_chart").insert({
    seat: input.seat,
    parent_id: input.parentId,
    member_id: input.memberId,
    duties: input.duties,
    sort_order: count ?? 0,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/ac")
}

export async function updateSeat(
  id: string,
  input: { seat: string; memberId: string | null; duties: string | null },
) {
  const supabase = await requireUser()

  const { error } = await supabase
    .from("accountability_chart")
    .update({ seat: input.seat, member_id: input.memberId, duties: input.duties })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/ac")
}

export async function deleteSeat(id: string) {
  const supabase = await requireUser()

  const { error } = await supabase.from("accountability_chart").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/ac")
}
