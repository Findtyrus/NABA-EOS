"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createProcessFromUpload } from "@/lib/actions/processes"

const MAX_BYTES = 50 * 1024 * 1024

export function UploadDropzone() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (file.size > MAX_BYTES) {
      setError("File is larger than 50MB.")
      return
    }

    setIsUploading(true)
    const supabase = createClient()
    const filePath = `${crypto.randomUUID()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("process-documents")
      .upload(filePath, file)

    setIsUploading(false)

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    startTransition(async () => {
      await createProcessFromUpload({
        processName: file.name.replace(/\.[^/.]+$/, ""),
        filePath,
        fileName: file.name,
        fileSize: file.size,
      })
      router.refresh()
    })
  }

  const busy = isUploading || isPending

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-12 text-center transition-colors hover:bg-primary/10 disabled:opacity-60"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Upload className="size-6" />
        </span>
        <p className="font-semibold">
          {busy ? "Uploading..." : "Click to select files from your computer"}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports Word, PDF, Google Docs links &middot; Max 50MB per file
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".doc,.docx,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
