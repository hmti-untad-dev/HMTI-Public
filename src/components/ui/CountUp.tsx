'use client'

import { useEffect, useRef } from 'react'

import { afterBoot } from '@/lib/boot'

/**
 * Angka yang menghitung naik saat masuk layar. HTML awal sudah memuat angka akhir (aman tanpa JS, mesin cari,
 * dan gerak-dikurangi); animasi hanya mengganti teksnya sementara. Angka tabular supaya lebar tidak bergoyang.
 */
export function CountUp({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || value < 2) return
    let raf = 0
    let io: IntersectionObserver | undefined
    const run = () => {
      const t0 = performance.now()
      const dur = Math.min(1400, 500 + value * 12)
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        el.textContent = String(Math.round(value * (1 - Math.pow(1 - t, 3))))
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }
    el.textContent = '0'
    const cancelBoot = afterBoot(() => {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            io?.disconnect()
            run()
          }
        },
        { threshold: 0.4 },
      )
      io.observe(el)
    })
    return () => {
      cancelBoot()
      io?.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = String(value)
    }
  }, [value])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  )
}
