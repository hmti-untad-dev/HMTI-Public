'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'

const COLS = 20
const ROWS = 20
const frac = (n: number) => n - Math.floor(n)

// Urutan larut tiap sel tirai (0..1): sedikit condong kiri-ke-kanan, sisanya acak.
// Dari hash, bukan Math.random, agar server dan klien sama (hydration aman).
const CURTAIN = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  return Number(((col / (COLS - 1)) * 0.45 + frac(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) * 0.55).toFixed(3))
})
const MARK = Array.from({ length: 64 }, (_, i) => Number(frac(Math.sin(i * 91.17 + 3.3) * 24634.6345).toFixed(3)))

/**
 * Tirai pembuka <= 1 detik. Seluruh linimasa ada di CSS (globals.css, blok "Layar boot"), jadi berjalan sejak
 * paint pertama walau JS belum dimuat, dan berakhir sendiri. Tampil di setiap muat penuh halaman (skrip <head>
 * di layout memasang html[data-intro='boot']), tidak saat pindah halaman lewat menu.
 * Komponen ini hanya menambah dua hal: melewati tirai pada interaksi apa pun, dan menandai html[data-boot]='done'
 * untuk animasi yang menunggu (lib/boot.ts).
 */
export function BootScreen() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.boot !== 'running') return
    const done = () => {
      root.dataset.boot = 'done'
    }
    const skip = () => {
      ref.current?.classList.add('is-skip')
      done()
      cleanup()
    }
    // Sisa waktu tirai dihitung dari awal navigasi, karena CSS sudah berjalan sebelum JS ini dimuat.
    const timer = window.setTimeout(done, Math.max(0, 1000 - performance.now()))
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, skip))
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      cleanup()
    }
  }, [])

  return (
    <div ref={ref} className="boot" aria-hidden="true">
      <div className="boot-cells">
        {CURTAIN.map((t, i) => (
          <i key={i} style={{ '--t': t } as CSSProperties} />
        ))}
      </div>
      <div className="boot-core">
        <div className="boot-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hmti-logo.webp" alt="" width={88} height={88} />
          <div className="boot-mark-px">
            {MARK.map((t, i) => (
              <i key={i} style={{ '--t': t } as CSSProperties} />
            ))}
          </div>
        </div>
        <p className="boot-log">
          [ OK ] <b>hmti-os 2026 · siap</b>
        </p>
        <div className="boot-bar">
          <i />
        </div>
      </div>
    </div>
  )
}
