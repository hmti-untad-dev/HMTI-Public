'use client'

import Link from '@/components/ui/AppLink'
import { useEffect, useState } from 'react'

/**
 * Lambang + nama himpunan. Setelah halaman digulir, nama menarik diri ke balik lambang supaya bilah lebih ringkas;
 * kembali muncul saat di-hover atau difokus. Nama tetap ada di HTML untuk pembaca layar.
 */
export function BrandLink({ orgName }: { orgName: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Link
      href="/"
      data-scrolled={scrolled}
      className="brand flex shrink-0 items-center overflow-hidden whitespace-nowrap font-display text-base font-bold text-ink sm:text-lg"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/hmti-logo.webp" alt="" width={36} height={36} className="relative z-10 size-9 rounded-full" />
      <span className="brand-word ml-2.5 sm:ml-3">{orgName}</span>
    </Link>
  )
}
