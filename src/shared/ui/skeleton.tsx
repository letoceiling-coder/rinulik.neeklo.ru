import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-zinc-800 via-zinc-700/80 to-zinc-800 bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
