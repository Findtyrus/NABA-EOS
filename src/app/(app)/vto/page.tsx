import { AppHeader } from "@/components/app-header"
import { VtoEmptyState } from "@/components/vto/vto-empty-state"
import { VtoSummary } from "@/components/vto/vto-summary"
import { getVto } from "@/lib/data/vto"
import { isVtoStarted } from "@/lib/vto-shared"

export default async function VtoPage() {
  const vto = await getVto()

  return (
    <>
      <AppHeader title="V/TO" />
      {isVtoStarted(vto) ? <VtoSummary vto={vto} /> : <VtoEmptyState />}
    </>
  )
}
