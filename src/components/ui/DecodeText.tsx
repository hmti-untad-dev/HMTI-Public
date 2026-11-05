'use client'

import { useEffect, useRef, useState } from 'react'

import { afterBoot } from '@/lib/boot'

const GLYPHS = '01<>/{}[]#$%&*+=?'

/**
 * Teks yang "terdekripsi" huruf demi huruf saat pertama masuk layar (efek konsol). Teks asli selalu ada di
 * HTML dan dibaca pembaca layar lewat aria-label; animasinya hanya tampilan. Mati bila gerak dikurangi.
 */
export function DecodeText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let io: IntersectionObserver | undefined
    const run = () => {
      const t0 = performance.now()
      const dur = 380 + text.length * 28
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        const keep = Math.floor(t * text.length)
        setShown(
          text
            .split('')
            .map((c, i) => (i < keep || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(''),
        )
        if (t < 1) raf = requestAnimationFrame(step)
        else setShown(text)
      }
      raf = requestAnimationFrame(step)
    }
    const rect = el.getBoundingClientRect()
    const seen = rect.top < window.innerHeight * 0.92 && document.documentElement.dataset.boot !== 'running'
    if (seen) return // sudah terlihat saat halaman dimuat: biarkan, jangan berkedip
    const cancelBoot = afterBoot(() => {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            io?.disconnect()
            run()
          }
        },
        { threshold: 0.6 },
      )
      io.observe(el)
    })
    return () => {
      cancelBoot()
      io?.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [text])

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </span>
  )
}
