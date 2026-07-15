import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { ProcessesView } from "@/components/processes/processes-view"
import { getProcesses, getCurrentMemberId } from "@/lib/data/processes"

export default async function ProcessesPage() {
  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const processes = await getProcesses()

  return (
    <>
      <AppHeader title="Processes" />
      <ProcessesView processes={processes} />
    </>
  )
}
