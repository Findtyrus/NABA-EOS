"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return { supabase, user }
}

export async function createProcessFromUpload(input: {
  processName: string
  filePath: string
  fileName: string
  fileSize: number
}) {
  const { supabase, user } = await requireUser()

  const { error } = await supabase.from("processes").insert({
    process_name: input.processName,
    owner_id: user.id,
    source_type: "upload",
    file_path: input.filePath,
    file_name: input.fileName,
    file_size: input.fileSize,
    status: "Not started",
  })

  if (error) throw new Error(error.message)
  revalidatePath("/processes")
}

export async function createProcessFromScratch(input: { processName: string; content: string }) {
  const { supabase, user } = await requireUser()

  const { error } = await supabase.from("processes").insert({
    process_name: input.processName,
    owner_id: user.id,
    source_type: "scratch",
    content: input.content,
    status: "Not started",
  })

  if (error) throw new Error(error.message)
  revalidatePath("/processes")
}

export async function updateProcessContent(id: string, content: string) {
  const { supabase } = await requireUser()

  const { error } = await supabase
    .from("processes")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/processes")
  revalidatePath(`/processes/${id}`)
}

export async function deleteProcess(id: string, filePath: string | null) {
  const { supabase } = await requireUser()

  if (filePath) {
    await supabase.storage.from("process-documents").remove([filePath])
  }

  const { error } = await supabase.from("processes").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/processes")
}

export async function getSignedDownloadUrl(filePath: string) {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.storage
    .from("process-documents")
    .createSignedUrl(filePath, 60)

  if (error || !data) throw new Error(error?.message ?? "Failed to create download link")
  return data.signedUrl
}
