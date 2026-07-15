import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-primary px-4 text-primary-foreground">
      <SidebarTrigger className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  )
}
