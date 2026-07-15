import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MeetingsSection } from "@/components/dashboard/meetings-section"
import { TodosSection } from "@/components/dashboard/todos-section"
import { RocksSection } from "@/components/dashboard/rocks-section"
import { MeasurablesSection } from "@/components/dashboard/measurables-section"
import { getCurrentMember, getDashboardData } from "@/lib/data/dashboard"

export default async function DashboardPage() {
  const member = await getCurrentMember()
  if (!member) redirect("/login")

  const { todos, meetings, rocks, scorecard } = await getDashboardData(member.id)

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="flex-1 space-y-1 p-6">
        <h1 className="mb-4 text-xl font-extrabold tracking-tight">DASHBOARD</h1>
        <MeetingsSection meetings={meetings} />
        <TodosSection todos={todos} />
        <RocksSection rocks={rocks} />
        <MeasurablesSection scorecard={scorecard} />
      </div>
    </>
  )
}
