export type ProcessSourceType = "upload" | "scratch"

export type ProcessDoc = {
  id: string
  process_name: string
  owner_id: string | null
  location: string | null
  status: string
  source_type: ProcessSourceType
  file_path: string | null
  file_name: string | null
  file_size: number | null
  content: string | null
  created_at: string
  updated_at: string
  owner: { full_name: string } | null
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) return ""
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
