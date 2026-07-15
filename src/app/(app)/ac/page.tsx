import { AppHeader } from "@/components/app-header"
import { AcEmptyState } from "@/components/ac/ac-empty-state"
import { AcChart } from "@/components/ac/ac-chart"
import { getSeats } from "@/lib/data/ac"
import { getMembers } from "@/lib/data/meetings"

export default async function AcPage() {
  const [seats, members] = await Promise.all([getSeats(), getMembers()])

  return (
    <>
      <AppHeader title="A/C" />
      {seats.length === 0 ? <AcEmptyState /> : <AcChart seats={seats} members={members} />}
    </>
  )
}
