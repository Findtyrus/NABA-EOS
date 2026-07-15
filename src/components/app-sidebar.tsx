"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users2,
  Compass,
  Network,
  LineChart,
  ClipboardCheck,
  BookOpen,
  UsersRound,
  ChevronRight,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meetings", url: "/meetings", icon: Users2 },
  { title: "V/TO", url: "/vto", icon: Compass },
  { title: "A/C", url: "/ac", icon: Network },
  { title: "Insights", url: "/insights", icon: LineChart },
  { title: "Processes", url: "/processes", icon: BookOpen },
  { title: "Teams", url: "/teams", icon: UsersRound },
]

const ASSESSMENT_ITEMS = [
  { title: "Org Checkup", url: "/assessments/org-checkup" },
  { title: "Culture Checkup", url: "/assessments/culture-checkup" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            N
          </span>
          <span className="text-base font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            NABA
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const isActive = pathname?.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              <Collapsible defaultOpen={pathname?.startsWith("/assessments")} className="group/assessments">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={pathname?.startsWith("/assessments")}
                        tooltip="Assessments"
                      />
                    }
                  >
                    <ClipboardCheck />
                    <span>Assessments</span>
                    <ChevronRight className="ml-auto size-4 transition-transform group-data-[panel-open]/assessments:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {ASSESSMENT_ITEMS.map((item) => (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton
                          render={<Link href={item.url} />}
                          className={cn(pathname?.startsWith(item.url) && "text-accent-foreground")}
                        >
                          {item.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>

              {NAV_ITEMS.slice(5).map((item) => {
                const isActive = pathname?.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
