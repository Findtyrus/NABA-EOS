import { createClient } from "@/lib/supabase/server"

export type Member = {
  id: string
  full_name: string
  seat: string | null
  email: string
  is_owner: boolean
}

export type Todo = {
  id: string
  todo: string
  owner_id: string | null
  due_date: string | null
  completed: boolean
  meeting_id: string | null
  notes: string | null
  action_label: string | null
  action_href: string | null
}

export type Meeting = {
  id: string
  title: string
  meeting_date: string
  notes: string | null
}

export type Rock = {
  id: string
  rock: string
  owner_id: string | null
  due_date: string | null
  status: string
}

export type Scorecard = {
  id: string
  metric: string
  owner_id: string | null
  target: string | null
  current_value: string | null
  status: string
}

export async function getCurrentMember(): Promise<Member | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("members")
    .select("id, full_name, seat, email, is_owner")
    .eq("id", user.id)
    .single()

  return data
}

export async function getDashboardData(memberId: string) {
  const supabase = await createClient()

  const [todos, meetings, rocks, scorecard] = await Promise.all([
    supabase
      .from("todos")
      .select(
        "id, todo, owner_id, due_date, completed, meeting_id, notes, action_label, action_href",
      )
      .eq("owner_id", memberId)
      .order("completed", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("meetings")
      .select("id, title, meeting_date, notes")
      .gte("meeting_date", new Date().toISOString().slice(0, 10))
      .order("meeting_date", { ascending: true }),
    supabase
      .from("rocks")
      .select("id, rock, owner_id, due_date, status")
      .eq("owner_id", memberId),
    supabase
      .from("scorecard")
      .select("id, metric, owner_id, target, current_value, status")
      .eq("owner_id", memberId),
  ])

  return {
    todos: (todos.data ?? []) as Todo[],
    meetings: (meetings.data ?? []) as Meeting[],
    rocks: (rocks.data ?? []) as Rock[],
    scorecard: (scorecard.data ?? []) as Scorecard[],
  }
}
