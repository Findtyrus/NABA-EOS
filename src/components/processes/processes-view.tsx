"use client"

import Link from "next/link"
import { FileText, File, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadDropzone } from "@/components/processes/upload-dropzone"
import { CreateScratchDialog } from "@/components/processes/create-scratch-dialog"
import { formatFileSize, type ProcessDoc } from "@/lib/processes-shared"

function ProcessCard({ process }: { process: ProcessDoc }) {
  const Icon = process.source_type === "upload" ? File : FileText
  return (
    <Link
      href={`/processes/${process.id}`}
      className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{process.process_name}</p>
        <p className="text-sm text-muted-foreground">
          {process.owner?.full_name ?? "Unassigned"}
          {process.source_type === "upload" && process.file_size
            ? ` · ${formatFileSize(process.file_size)}`
            : ""}
          {" · "}
          {process.status}
        </p>
      </div>
    </Link>
  )
}

export function ProcessesView({ processes }: { processes: ProcessDoc[] }) {
  if (processes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-xl font-bold">Add Your Process Documents</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your existing process documents or create new ones. Most chapters have 3-5 core
            processes that keep operations consistent.
          </p>

          <div className="mt-6">
            <UploadDropzone />
          </div>

          <CreateScratchDialog
            trigger={
              <Button variant="outline" className="mt-4">
                Don&apos;t Have Any Documents? Create One From Scratch
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Processes</h1>
        <CreateScratchDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="size-4" /> Add Process
            </Button>
          }
        />
      </div>

      <div className="mb-6">
        <UploadDropzone />
      </div>

      <div className="space-y-3">
        {processes.map((process) => (
          <ProcessCard key={process.id} process={process} />
        ))}
      </div>
    </div>
  )
}
