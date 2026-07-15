import type { MemberOption } from "@/lib/meetings-shared"

export type Seat = {
  id: string
  seat: string
  member_id: string | null
  duties: string | null
  sort_order: number
  parent_id: string | null
  member: MemberOption | null
}

export type SeatNode = Seat & { children: SeatNode[] }

export function buildTree(seats: Seat[]): SeatNode[] {
  const nodes = new Map<string, SeatNode>(seats.map((s) => [s.id, { ...s, children: [] }]))
  const roots: SeatNode[] = []

  for (const seat of seats) {
    const node = nodes.get(seat.id)!
    if (seat.parent_id && nodes.has(seat.parent_id)) {
      nodes.get(seat.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const bySortOrder = (a: SeatNode, b: SeatNode) => a.sort_order - b.sort_order
  for (const node of nodes.values()) node.children.sort(bySortOrder)
  roots.sort(bySortOrder)

  return roots
}

export function isSeatIncomplete(seat: Seat) {
  return !seat.member_id || !seat.duties?.trim()
}

export function countIncomplete(seats: Seat[]) {
  return seats.filter(isSeatIncomplete).length
}

export const DEFAULT_CHART_SEATS = [
  { seat: "Visionary", parentIndex: null },
  { seat: "Integrator", parentIndex: 0 },
  { seat: "Marketing/Sales", parentIndex: 1 },
  { seat: "Operations", parentIndex: 1 },
  { seat: "Finance", parentIndex: 1 },
] as const
