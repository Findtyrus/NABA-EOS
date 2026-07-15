import { notFound, redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { CheckupDetail } from "@/components/assessments/checkup-detail"
import { getAssessmentConfig } from "@/lib/assessments-shared"
import {
  getCheckup,
  getResponses,
  getMyResponse,
  getMemberCount,
  getCurrentMemberId,
} from "@/lib/data/assessments"

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id } = await params
  const config = getAssessmentConfig(type)
  if (!config) notFound()

  const memberId = await getCurrentMemberId()
  if (!memberId) redirect("/login")

  const checkup = await getCheckup(id)
  if (!checkup || checkup.type !== config.id) notFound()

  const [allResponses, myResponse, memberCount] = await Promise.all([
    getResponses(id),
    getMyResponse(id, memberId),
    getMemberCount(),
  ])

  const title = `${config.label} ${new Date(`${checkup.survey_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  return (
    <>
      <AppHeader title={config.label} />
      <CheckupDetail
        config={config}
        checkup={checkup}
        title={title}
        myResponse={myResponse}
        allResponses={allResponses}
        memberCount={memberCount}
      />
    </>
  )
}
