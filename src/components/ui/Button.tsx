import Link from '@/components/ui/AppLink'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  variant?: 'solid' | 'outline'
  className?: string
}

const base =
  'inline-flex items-center justify-center rounded-control px-4 py-2 text-sm font-medium transition-[background-color,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]'
const variants = {
  solid: 'bg-brand text-on-brand hover:bg-brand-strong',
  outline: 'border border-brand text-link hover:bg-brand-soft/50',
}

export function Button({ href, children, variant = 'solid', className = '' }: Props) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  )
}
