import type { LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export function getLucideIcon(key: string): LucideIcon {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[key]
  return Icon ?? LucideIcons.Circle
}
