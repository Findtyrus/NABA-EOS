import {
  Users2,
  LineChart,
  Gem,
  Megaphone,
  ClipboardCheck,
  Diamond,
  ThumbsUp,
  Circle,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Segue: Users2,
  Scorecard: LineChart,
  "Scorecard Review": LineChart,
  "Rock Review": Gem,
  "Rock Setting": Gem,
  Headlines: Megaphone,
  "To-Do List": ClipboardCheck,
  IDS: Diamond,
  Conclude: ThumbsUp,
}

export function agendaIcon(label: string): LucideIcon {
  return ICON_MAP[label] ?? Circle
}
