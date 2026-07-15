"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Download, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatFileSize, type ProcessDoc } from "@/lib/processes-shared"
import { updateProcessContent, deleteProcess, getSignedDownloadUrl } from "@/lib/actions/processes"

export function ProcessDetail({ process }: { process: ProcessDoc }) {
  const router = useRouter()
  const [content, setContent] = useState(process.content ?? "")
  const [isPending, startTransition] = useTransition()
  const [isDownloading, setIsDownloading] = useState(false)

  function handleSave() {
    startTransition(async () => {
      await updateProcessContent(process.id, content)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`Delete "${process.process_name}"?`)) return
    startTransition(async () => {
      await deleteProcess(process.id, process.file_path)
      router.push("/processes")
    })
  }

  async function handleDownload() {
    if (!process.file_path) return
    setIsDownloading(true)
    const url = await getSignedDownloadUrl(process.file_path)
    setIsDownloading(false)
    window.open(url, "_blank")
  }

  return (
    <div className="flex-1 p-6">
      <p className="text-sm">
        <Link href="/processes" className="text-accent-foreground hover:underline">
          Processes
        </Link>{" "}
        <span className="text-muted-foreground">&gt;</span> {process.process_name}
      </p>

      <div className="mb-4 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{process.process_name}</h1>
          <p className="text-sm text-muted-foreground">
            {process.owner?.full_name ?? "Unassigned"} &middot; {process.status}
          </p>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>

      {process.source_type === "upload" ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="font-semibold">{process.file_name}</p>
          <p className="mb-4 text-sm text-muted-foreground">{formatFileSize(process.file_size)}</p>
          <Button onClick={handleDownload} disabled={isDownloading} className="bg-primary hover:bg-primary/90">
            <Download className="size-4" /> {isDownloading ? "Preparing..." : "Download"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-primary/90">
              <Save className="size-4" /> {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
