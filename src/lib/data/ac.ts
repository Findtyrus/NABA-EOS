import { createClient } from "@/lib/supabase/server"
import type { Seat } from "@/lib/ac-shared"

export async function getSeats(): Promise<Seat[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("accountability_chart")
    .select(
      "id, seat, member_id, duties, sort_order, parent_id, member:members(id, full_name, email, license)",
    )
    .order("sort_order", { ascending: true })

  return (data ?? []) as unknown as Seat[]
}
