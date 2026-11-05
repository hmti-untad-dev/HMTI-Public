'use client'

import type { ReactNode } from 'react'
import { useEffect, useState, ViewTransition } from 'react'

declare global {
  interface Window {
    __hmtiNavigated?: boolean
  }
}

/**
 * Transisi pindah halaman lewat View Transitions API (React <ViewTransition>): halaman lama memudar sambil naik
 * dan sedikit kabur, halaman baru masuk dari bawah dan menajam. Navbar dan footer tidak ikut beranimasi (layout).
 * template.tsx dipasang ulang tiap navigasi, jadi enter/exit selalu terpicu. CSS: globals.css, "Transisi halaman".
 * Browser lama tanpa View Transitions memakai cadangan CSS sederhana (konten memudar naik). Mati bila gerak dikurangi.
 */
export default function Template({ children }: { children: ReactNode }) {
  // Muatan pertama dirender server: harus sama dengan hasil server (tanpa kelas) agar hydration aman.
  const [fallback] = useState(
    () => typeof window !== 'undefined' && window.__hmtiNavigated === true && !('startViewTransition' in document),
  )

  useEffect(() => {
    window.__hmtiNavigated = true
  }, [])

  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div className={fallback ? 'page-enter' : undefined}>{children}</div>
    </ViewTransition>
  )
}
