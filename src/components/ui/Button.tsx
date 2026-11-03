import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  variant?: 'solid' | 'outline'
  className?: string
}

const base =
  'inline-flex items-center justify-center rounded-control px-4 py-2 text-sm font-medium transition-colors'
const variants = {
  solid: 'bg-brand text-white hover:bg-brand-strong',
  outline: 'border border-brand text-brand hover:bg-brand-soft',
}

export function Button({ href, children, variant = 'solid', className = '' }: Props) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  )
}
