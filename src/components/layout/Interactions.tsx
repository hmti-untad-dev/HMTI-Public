'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Elemen yang diberi bingkai deteksi saat ditunjuk mouse atau difokus keyboard. */
const TARGETS = 'main a[href], main button, main summary, main [role="tab"], [data-cv]'
/** Area yang punya efek sendiri atau terlalu rapat (heatmap, panel pemindai, navbar). */
const SKIP = '[data-cv-skip], .scanner, .dither, body > header'

/**
 * Satu komponen kecil untuk semua interaksi halaman, memakai delegasi event (tanpa JS per kartu):
 * 1. Bingkai deteksi ala computer vision yang meluncur ke elemen yang ditunjuk (mouse) atau difokus (keyboard, semua perangkat).
 * 2. Kartu miring 3D mengikuti kursor pada elemen [data-tilt] (mouse saja).
 * 3. Parallax halus pada [data-parallax] (mouse saja), hanya dihitung saat elemen terlihat.
 * Semua gerak mati bila pengguna memilih gerak dikurangi; bingkai fokus tetap ada (tanpa animasi) untuk aksesibilitas.
 */
export function Interactions() {
  const box = useRef<HTMLDivElement>(null)
  // Dijalankan ulang tiap pindah halaman: elemen [data-parallax] baru didaftarkan, bingkai lama dilepas.
  const pathname = usePathname()

  useEffect(() => {
    const el = box.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let current: Element | null = null
    let raf = 0

    const place = (t: Element | null) => {
      current = t
      if (!t) {
        el.dataset.on = 'false'
        return
      }
      const r = t.getBoundingClientRect()
      const pad = 6
      el.style.transform = `translate(${Math.round(r.left - pad)}px, ${Math.round(r.top - pad)}px)`
      el.style.width = `${Math.round(r.width + pad * 2)}px`
      el.style.height = `${Math.round(r.height + pad * 2)}px`
      el.dataset.on = 'true'
    }
    const targetOf = (n: EventTarget | null) => {
      const t = n instanceof Element ? n.closest(TARGETS) : null
      return t && !t.closest(SKIP) ? t : null
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const t = targetOf(e.target)
      if (t !== current) place(t)
    }
    const onFocus = (e: FocusEvent) => {
      const t = targetOf(e.target)
      if (t && (t as HTMLElement).matches(':focus-visible')) place(t)
    }
    const onBlur = () => place(null)
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) place(null) // kursor keluar jendela
    }
    // Saat gulir atau kursor bergerak di atas elemen (yang mungkin sedang bergeser karena animasi hover),
    // bingkai diukur ulang paling banyak sekali per frame.
    const onScroll = () => {
      if (!current || raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        if (current) place(current)
      })
    }

    // Kartu miring
    let tilted: HTMLElement | null = null
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const card = e.target instanceof Element ? (e.target.closest('[data-tilt]') as HTMLElement | null) : null
      if (tilted && tilted !== card) {
        tilted.style.removeProperty('--rx')
        tilted.style.removeProperty('--ry')
        tilted.dataset.tilting = 'false'
      }
      tilted = card
      if (!card) return
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`)
      card.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
      card.dataset.tilting = 'true'
    }

    // Parallax
    const layers = new Set<HTMLElement>()
    let praf = 0
    const updateParallax = () => {
      praf = 0
      const vh = window.innerHeight
      layers.forEach((n) => {
        const r = (n.parentElement ?? n).getBoundingClientRect()
        const p = (r.top + r.height / 2 - vh / 2) / vh // -1..1 di sekitar tengah layar
        n.style.setProperty('--py', `${(-p * 18).toFixed(1)}px`)
      })
    }
    const onParallaxScroll = () => {
      if (!praf && layers.size) praf = requestAnimationFrame(updateParallax)
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? layers.add(en.target as HTMLElement) : layers.delete(en.target as HTMLElement)))
      onParallaxScroll()
    })

    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (fine) {
      document.addEventListener('pointermove', onScroll, { passive: true })
      document.addEventListener('pointerover', onOver)
      document.addEventListener('pointerout', onOut)
    }
    if (fine && !reduced) {
      document.addEventListener('pointermove', onMove, { passive: true })
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((n) => io.observe(n))
      window.addEventListener('scroll', onParallaxScroll, { passive: true })
    }

    return () => {
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointermove', onScroll)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onParallaxScroll)
      io.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(praf)
      place(null)
    }
  }, [pathname])

  return <div ref={box} className="cvb" aria-hidden="true" data-on="false" />
}
