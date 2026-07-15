import { AppHeader } from "@/components/app-header"
import { VtoWizard } from "@/components/vto/vto-wizard"
import { getVto } from "@/lib/data/vto"
import { getMembers } from "@/lib/data/meetings"

export default async function VtoEditPage() {
  const [vto, members] = await Promise.all([getVto(), getMembers()])

  return (
    <>
      <AppHeader title="V/TO" />
      <VtoWizard initialVto={vto} members={members} />
    </>
  )
}
