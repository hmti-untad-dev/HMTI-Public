'use client'

import { useEffect } from 'react'

/**
 * Gulir halus (Lenis) khusus perangkat dengan mouse/trackpad. Di layar sentuh gulir native sudah halus dan
 * lebih ringan, jadi Lenis tidak dimuat sama sekali (import dinamis = file terpisah, tidak masuk bundel HP).
 * Mati bila pengguna memilih gerak dikurangi. Tautan jangkar (#denyut, #tim) tetap bekerja lewat opsi anchors; Lenis mengikuti scroll-margin-top
 * target (scroll-mt-28 pada Section = 112px), jadi ruang untuk navbar dan daftar isi lengket tidak dihitung dua kali.
 */
export function SmoothScroll() {
  useEffect(() => {
    const ok = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ok) return
    let lenis: { destroy: () => void } | undefined
    let cancelled = false
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({ autoRaf: true, lerp: 0.2, anchors: true, allowNestedScroll: true })
    })
    return () => {
      cancelled = true
      lenis?.destroy()
    }
  }, [])
  return null
}
