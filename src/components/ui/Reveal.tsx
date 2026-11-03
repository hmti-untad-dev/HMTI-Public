'use client'

import { type ElementType, type ReactNode, useEffect, useRef } from 'react'

type Props = {
  children: ReactNode
  /** true: anak-anak muncul berurutan (maks. 8). false: seluruh blok memudar naik. */
  stagger?: boolean
  as?: ElementType
  className?: string
}

/**
 * Menampilkan blok dengan transisi halus saat masuk layar. Aman tanpa JS dan untuk gerak-dikurangi:
 * konten baru disembunyikan (data-state=pending) oleh efek ini hanya bila ada di bawah lipatan.
 */
export function Reveal({ children, stagger = false, as: Tag = 'div', className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92) return // sudah terlihat: biarkan
    el.dataset.state = 'pending'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.state = 'in'
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} data-rv={stagger ? 'stagger' : 'fade'} className={className}>
      {children}
    </Tag>
  )
}
