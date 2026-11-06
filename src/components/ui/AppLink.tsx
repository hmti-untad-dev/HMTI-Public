'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

import { TransitionLink } from '@/components/page-transition/page-transition'

type Props = ComponentProps<typeof Link>

/**
 * Pengganti next/link untuk seluruh situs: pindah halaman memakai transisi garis (StripeTransition di layout).
 * Tautan yang tidak berpindah halaman (jangkar #, halaman yang sama, URL luar, href objek) tetap memakai Link
 * biasa, karena TransitionLink menahan navigasi ke halaman yang sama sehingga jangkar tidak bergulir.
 */
export default function AppLink(props: Props) {
  const pathname = usePathname()
  const { href } = props
  if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return <Link {...props} />
  const path = href.split(/[?#]/)[0].replace(/(.)\/+$/, '$1')
  if (path === pathname.replace(/(.)\/+$/, '$1')) return <Link {...props} />
  return <TransitionLink {...props} href={href} />
}
