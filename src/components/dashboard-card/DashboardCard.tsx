import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export interface DashboardCardProps {
  title: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  loading?: boolean
}

export function DashboardCard({
  title,
  value,
  hint,
  icon: Icon,
  loading,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            {title}
          </CardTitle>
          {Icon ? (
            <Icon className="size-4 text-violet-400/80" aria-hidden />
          ) : null}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-800" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight text-white">
              {value}
            </p>
          )}
          {hint ? (
            <p className="mt-1 text-xs text-zinc-500">{hint}</p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  )
}
