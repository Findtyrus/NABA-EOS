import { notFound, redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { ProcessDetail } from "@/components/processes/process-detail"
import { getProcess, getCurrentMemberId } from "@/lib/data/processes"

export default async function ProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const process = await getProcess(id)
  if (!process) notFound()

  return (
    <>
      <AppHeader title="Processes" />
      <ProcessDetail process={process} />
    </>
  )
}
