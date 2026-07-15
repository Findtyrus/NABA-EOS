import Link from "next/link"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VtoData } from "@/lib/vto-shared"

function money(n: number | null) {
  return n == null ? "—" : `$${n.toLocaleString()}`
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-5">
      <h3 className="mb-3 text-sm font-bold tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

export function VtoSummary({ vto }: { vto: VtoData }) {
  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vision/Traction Organizer</h1>
        <Button render={<Link href="/vto/edit" />} nativeButton={false} variant="outline">
          <Pencil className="size-4" />
          Edit V/TO
        </Button>
      </div>

      <Section title="CORE VALUES">
        <ul className="space-y-2">
          {vto.core_values
            .filter((v) => v.name)
            .map((v, i) => (
              <li key={i} className="text-sm">
                <span className="font-semibold">{v.name}</span>
                {v.description && (
                  <span className="text-muted-foreground"> — {v.description}</span>
                )}
              </li>
            ))}
        </ul>
      </Section>

      <Section title="CORE FOCUS">
        <p className="text-sm capitalize text-muted-foreground">{vto.core_focus_type}</p>
        <p className="text-sm">{vto.purpose}</p>
        <p className="mt-2 text-sm font-semibold">Niche</p>
        <p className="text-sm">{vto.niche}</p>
      </Section>

      <Section title="SEMESTER TARGET">
        <p className="text-sm">{vto.semester_target}</p>
      </Section>

      <Section title="MARKETING STRATEGY">
        <p className="text-sm font-semibold">Target Market</p>
        <p className="mb-2 text-sm">{vto.mkt_audience}</p>
        <p className="text-sm font-semibold">3 Uniques</p>
        <ul className="mb-2 list-disc pl-5 text-sm">
          {vto.mkt_uniques.filter(Boolean).map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
        <p className="text-sm font-semibold">Proven Process</p>
        <p className="mb-2 text-sm">{vto.mkt_process}</p>
        <p className="text-sm font-semibold">Guarantee</p>
        <p className="text-sm">{vto.mkt_guarantee}</p>
      </Section>

      <Section title="END-OF-YEAR PICTURE">
        <p className="text-sm text-muted-foreground">
          {vto.eoy_date ?? "No date set"} &middot; Membership goal:{" "}
          {vto.eoy_membership_goal ?? "—"} &middot; Financial goal: {money(vto.eoy_financial_goal)}
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {vto.eoy_picture.filter(Boolean).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Section>

      <Section title="NEXT-YEAR PLAN">
        <p className="text-sm text-muted-foreground">
          {vto.next_year_date ?? "No date set"} &middot; Membership goal:{" "}
          {vto.next_year_membership_goal ?? "—"} &middot; Financial goal:{" "}
          {money(vto.next_year_financial_goal)}
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {vto.next_year_goals.filter(Boolean).map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
