import { createClient } from "@/lib/supabase/server"
import type { ProcessDoc } from "@/lib/processes-shared"

export async function getCurrentMemberId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getProcesses(): Promise<ProcessDoc[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("processes")
    .select(
      "id, process_name, owner_id, location, status, source_type, file_path, file_name, file_size, content, created_at, updated_at, owner:members(full_name)",
    )
    .order("created_at", { ascending: false })
  return (data ?? []) as unknown as ProcessDoc[]
}

export async function getProcess(id: string): Promise<ProcessDoc | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("processes")
    .select(
      "id, process_name, owner_id, location, status, source_type, file_path, file_name, file_size, content, created_at, updated_at, owner:members(full_name)",
    )
    .eq("id", id)
    .single()
  return data as unknown as ProcessDoc | null
}
