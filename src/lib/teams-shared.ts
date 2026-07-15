import {
  Settings,
  Landmark,
  UserRound,
  ShoppingCart,
  Box,
  Palette,
  Megaphone,
  Headphones,
  Wrench,
  Scale,
  Calculator,
  UserPlus,
  TrendingUp,
  Package,
  Wand2,
  Radio,
  HeadsetIcon,
  RefreshCw,
  Code2,
  FlaskConical,
  Warehouse,
  Truck,
  ShieldCheck,
  Users,
  UsersRound,
  Network,
  MessageCircle,
  Share2,
  GitBranch,
  Globe,
  type LucideIcon,
} from "lucide-react"
import type { MemberOption } from "@/lib/meetings-shared"

export const TEAM_ICONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "operations", label: "Operations", icon: Settings },
  { key: "finance", label: "Finance", icon: Landmark },
  { key: "hr", label: "HR", icon: UserRound },
  { key: "sales", label: "Sales", icon: ShoppingCart },
  { key: "product", label: "Product", icon: Box },
  { key: "design", label: "Design", icon: Palette },
  { key: "marketing", label: "Marketing", icon: Megaphone },
  { key: "support", label: "Support", icon: Headphones },
  { key: "engineering", label: "Engineering", icon: Wrench },
  { key: "legal", label: "Legal", icon: Scale },
  { key: "accounting", label: "Accounting", icon: Calculator },
  { key: "recruiting", label: "Recruiting", icon: UserPlus },
  { key: "sales_growth", label: "Sales Growth", icon: TrendingUp },
  { key: "product_dev", label: "Product Dev", icon: Package },
  { key: "creative", label: "Creative", icon: Wand2 },
  { key: "advertising", label: "Advertising", icon: Radio },
  { key: "customer_service", label: "Customer Service", icon: HeadsetIcon },
  { key: "customer_success", label: "Customer Success", icon: RefreshCw },
  { key: "development", label: "Development", icon: Code2 },
  { key: "research", label: "Research", icon: FlaskConical },
  { key: "logistics", label: "Logistics", icon: Warehouse },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "users", label: "Users", icon: Users },
  { key: "team", label: "Team", icon: UsersRound },
  { key: "network", label: "Network", icon: Network },
  { key: "communications", label: "Communications", icon: MessageCircle },
  { key: "outreach", label: "Outreach", icon: Share2 },
  { key: "planning", label: "Planning", icon: GitBranch },
  { key: "chapter", label: "Chapter", icon: Globe },
]

export function getTeamIcon(key: string | null): LucideIcon {
  return TEAM_ICONS.find((i) => i.key === key)?.icon ?? Users
}

export const TEAM_COLORS: { key: string; label: string; hex: string }[] = [
  { key: "red", label: "Red", hex: "#C42847" },
  { key: "orange", label: "Orange", hex: "#EF7001" },
  { key: "gold", label: "Gold", hex: "#E7A029" },
  { key: "green", label: "Green", hex: "#01805E" },
  { key: "teal", label: "Teal", hex: "#00A9AD" },
  { key: "blue", label: "Blue", hex: "#2589BD" },
  { key: "purple", label: "Purple", hex: "#7A56A7" },
  { key: "gray", label: "Gray", hex: "#707070" },
]

export function getTeamColor(key: string | null): string {
  return TEAM_COLORS.find((c) => c.key === key)?.hex ?? "#C1C6C8"
}

export type Team = {
  id: string
  name: string
  description: string | null
  leader_id: string | null
  color_tag: string | null
  icon: string | null
  created_at: string
  leader: MemberOption | null
}

export type Roster = MemberOption & { seat: string | null; is_owner: boolean }
