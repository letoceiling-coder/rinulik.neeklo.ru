import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500',
        secondary:
          'border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10',
        ghost: 'text-zinc-300 hover:bg-white/10 hover:text-white',
        link: 'text-violet-400 underline-offset-4 hover:underline',
        destructive:
          'border border-red-500/40 bg-red-950/80 text-red-100 hover:bg-red-900/80 hover:border-red-400/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
