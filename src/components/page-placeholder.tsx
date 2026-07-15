import { AppHeader } from "@/components/app-header"

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <>
      <AppHeader title={title} />
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          {title} — content coming next.
        </p>
      </div>
    </>
  )
}
