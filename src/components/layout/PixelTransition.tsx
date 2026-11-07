'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'

import { type CoverAnimation, TransitionProvider } from '@/components/page-transition/page-transition'

type Phase = 'idle' | 'in' | 'out'
type Cell = { din: number; dout: number }

/** Durasi (ms), harus cocok dengan blok "Transisi halaman piksel" di globals.css. */
const SPREAD = 300
const CELL_IN = 180
const CELL_OUT = 170
const REDUCED = 160

const frac = (n: number) => n - Math.floor(n)
const hash = (i: number, seed: number) => frac(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453)

/**
 * Transisi pindah halaman bertema layar boot (hmti-os): tirai piksel menyebar dari titik yang diklik dengan tepi
 * biru HMTI, lalu di tengah muncul log "[ .. ] memuat /tujuan" dan bilah muat. Setelah halaman baru siap, log
 * menjadi "[ OK ]" dan piksel larut dari titik yang sama, sehingga halaman baru terbuka dari tempat pengguna menekan.
 * Navigasi keyboard atau tombol Back menyebar dari tengah layar. Dengan gerak dikurangi: hanya pudar singkat.
 * Logika kapan menutup dan membuka ada di TransitionProvider (components/page-transition).
 */
export function PixelTransition({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [reduced, setReduced] = useState(false)
  const [grid, setGrid] = useState<{ cols: number; size: number; cells: Cell[] }>({ cols: 0, size: 0, cells: [] })
  const [path, setPath] = useState('/')
  const pointer = useRef({ x: 0, y: 0, at: 0 })
  const seed = useRef(0)

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, at: Date.now() }
    }
    window.addEventListener('pointerdown', onDown, { capture: true, passive: true })
    return () => window.removeEventListener('pointerdown', onDown, { capture: true })
  }, [])

  const coverIn: CoverAnimation = (isReduced, href) =>
    new Promise((resolve) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const cols = w < 640 ? 8 : w < 1024 ? 12 : 16
      const size = w / cols
      const rows = Math.ceil(h / size)
      const recent = Date.now() - pointer.current.at < 2000
      const ox = recent ? pointer.current.x : w / 2
      const oy = recent ? pointer.current.y : h / 2
      const far = Math.max(Math.hypot(ox, oy), Math.hypot(w - ox, oy), Math.hypot(ox, h - oy), Math.hypot(w - ox, h - oy))
      seed.current += 1
      const cells = Array.from({ length: cols * rows }, (_, i) => {
        const cx = ((i % cols) + 0.5) * size
        const cy = (Math.floor(i / cols) + 0.5) * size
        const d = Math.hypot(cx - ox, cy - oy) / far
        return {
          din: Math.round((d * 0.8 + hash(i, seed.current) * 0.2) * SPREAD),
          dout: Math.round((d * 0.75 + hash(i, seed.current + 7) * 0.25) * SPREAD),
        }
      })
      let target = '/'
      try {
        target = decodeURIComponent(new URL(href ?? '/', window.location.href).pathname)
      } catch {}
      setPath(target)
      setGrid({ cols, size, cells })
      setReduced(isReduced)
      setPhase('in')
      window.setTimeout(resolve, isReduced ? REDUCED : SPREAD + CELL_IN + 20)
    })

  const coverOut: CoverAnimation = (isReduced) =>
    new Promise((resolve) => {
      setPhase('out')
      window.setTimeout(
        () => {
          setPhase('idle')
          setGrid({ cols: 0, size: 0, cells: [] })
          resolve()
        },
        isReduced ? REDUCED : SPREAD + CELL_OUT + 20,
      )
    })

  return (
    <TransitionProvider coverIn={coverIn} coverOut={coverOut}>
      {children}
      <div
        aria-hidden="true"
        className="pxt"
        data-phase={phase}
        data-reduced={reduced || undefined}
        style={{ '--cols': grid.cols, '--cell': `${grid.size}px` } as CSSProperties}
      >
        <div className="pxt-cells">
          {grid.cells.map((c, i) => (
            <i key={i} style={{ '--d': `${c.din}ms`, '--o': `${c.dout}ms` } as CSSProperties} />
          ))}
        </div>
        {phase !== 'idle' && (
          <div className="pxt-core">
            <p className="pxt-log">
              <span>{phase === 'out' ? '[ OK ]' : '[ .. ]'}</span> memuat <b>{path}</b>
            </p>
            <div className="pxt-bar">
              <i />
            </div>
          </div>
        )}
      </div>
    </TransitionProvider>
  )
}
