import { notFound, redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { CheckupList } from "@/components/assessments/checkup-list"
import { getAssessmentConfig } from "@/lib/assessments-shared"
import { getCheckups, getResponses, getCurrentMemberId } from "@/lib/data/assessments"

export default async function AssessmentTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const config = getAssessmentConfig(type)
  if (!config) notFound()

  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const checkups = await getCheckups(config.id)
  const responseCounts: Record<string, number> = {}
  await Promise.all(
    checkups.map(async (c) => {
      const responses = await getResponses(c.id)
      responseCounts[c.id] = responses.length
    }),
  )

  return (
    <>
      <AppHeader title={config.label} />
      <CheckupList config={config} checkups={checkups} responseCounts={responseCounts} />
    </>
  )
}
