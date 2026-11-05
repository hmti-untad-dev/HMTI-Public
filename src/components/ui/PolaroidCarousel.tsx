'use client'

import { type CSSProperties, useCallback, useEffect, useRef } from 'react'

export type Polaroid = { id: number | string; src: string | null; caption: string }

type Props = {
  photos: Polaroid[]
  /** Dipakai sebagai nama wilayah carousel, mis. "The Best of 2026". */
  label: string
}

/** Kemiringan diam tiap polaroid, bergilir agar susunan tidak terlihat seragam. */
const REST = [-2.6, 1.8, -1.2, 2.9, -2, 1.3, -1.7]

/**
 * Carousel polaroid yang digantung di tali jemuran. Digeser dengan drag/swipe (ada inersia dan tepi yang
 * memantul), tombol panah, atau keyboard. Tiap foto berayun seperti bandul mengikuti kecepatan geser.
 * Fisika dihitung per frame lewat rAF dan hanya berjalan saat ada gerak; gerak dikurangi = tanpa ayunan/inersia.
 */
export function PolaroidCarousel({ photos, label }: Props) {
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])
  const wraps = useRef<(HTMLElement | null)[]>([])
  const sim = useRef({
    x: 0,
    vx: 0,
    dragging: false,
    moved: 0,
    startX: 0,
    startPointer: 0,
    lastPointer: 0,
    lastT: 0,
    anchor: null as number | null,
    a: [] as number[],
    av: [] as number[],
    raf: 0,
    last: 0,
    reduced: false,
  })

  const bounds = () => {
    const v = view.current
    const t = track.current
    if (!v || !t) return { min: 0, max: 0, step: 280 }
    const first = wraps.current[0]
    const second = wraps.current[1]
    const step = first && second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 280
    return { min: Math.min(0, v.clientWidth - t.scrollWidth), max: 0, step }
  }

  const frame = useCallback((now: number) => {
    const s = sim.current
    const dt = Math.min(0.034, (now - (s.last || now)) / 1000 || 0.016)
    s.last = now
    const { min, max } = bounds()

    if (!s.dragging) {
      if (s.anchor !== null) {
        // Pegas teredam kritis menuju jangkar (tombol panah atau pantulan tepi).
        const acc = -(s.x - s.anchor) * 140 - s.vx * 2 * Math.sqrt(140)
        s.vx += acc * dt
        s.x += s.vx * dt
        if (Math.abs(s.x - s.anchor) < 0.3 && Math.abs(s.vx) < 4) {
          s.x = s.anchor
          s.vx = 0
          s.anchor = null
        }
      } else {
        s.x += s.vx * dt
        s.vx *= Math.exp(-3.4 * dt)
        if (s.x > max || s.x < min) s.anchor = s.x > max ? max : min
        else if (Math.abs(s.vx) < 3) s.vx = 0
      }
    }
    if (track.current) track.current.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0)`

    // Ayunan bandul: tiap foto mengejar sudut target dengan pegas kurang teredam.
    let swinging = false
    cards.current.forEach((el, i) => {
      if (!el) return
      const rest = REST[i % REST.length]
      const target = s.reduced ? rest : rest + Math.max(-20, Math.min(20, -s.vx * 0.011))
      const k = 58 + (i % 4) * 7
      const c = 4.2 + (i % 3) * 0.6
      const a = s.a[i] ?? rest
      const av = s.av[i] ?? 0
      const nav = s.reduced ? 0 : av + (k * (target - a) - c * av) * dt
      const na = s.reduced ? target : a + nav * dt
      s.a[i] = na
      s.av[i] = nav
      el.style.transform = `rotate(${na.toFixed(2)}deg)`
      if (Math.abs(target - na) > 0.02 || Math.abs(nav) > 0.06) swinging = true
    })

    const moving = s.dragging || s.anchor !== null || Math.abs(s.vx) > 0.5 || swinging
    s.raf = moving ? requestAnimationFrame(frame) : 0
    if (!moving) s.last = 0
  }, [])

  const kick = useCallback(() => {
    if (!sim.current.raf) sim.current.raf = requestAnimationFrame(frame)
  }, [frame])

  useEffect(() => {
    const s = sim.current
    s.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    s.a = photos.map((_, i) => REST[i % REST.length])
    s.av = photos.map(() => 0)
    kick()
    const onResize = () => {
      const { min } = bounds()
      if (s.x < min) {
        s.x = min
        kick()
      }
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
  }, [photos, kick])

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const s = sim.current
    s.dragging = true
    s.moved = 0
    s.anchor = null
    s.startX = s.x
    s.startPointer = s.lastPointer = e.clientX
    s.lastT = performance.now()
    s.vx = 0
    view.current?.setPointerCapture(e.pointerId)
    kick()
  }
  const onMove = (e: React.PointerEvent) => {
    const s = sim.current
    if (!s.dragging) return
    const { min, max } = bounds()
    const now = performance.now()
    const raw = s.startX + (e.clientX - s.startPointer)
    // Di luar tepi: tarikan melemah (karet).
    s.x = raw > max ? max + (raw - max) * 0.35 : raw < min ? min + (raw - min) * 0.35 : raw
    const dtp = Math.max(1, now - s.lastT) / 1000
    const inst = (e.clientX - s.lastPointer) / dtp
    s.vx = s.vx * 0.6 + inst * 0.4
    s.moved += Math.abs(e.clientX - s.lastPointer)
    s.lastPointer = e.clientX
    s.lastT = now
    kick()
  }
  const onUp = (e: React.PointerEvent) => {
    const s = sim.current
    if (!s.dragging) return
    s.dragging = false
    if (performance.now() - s.lastT > 90) s.vx = 0 // berhenti dulu sebelum dilepas
    if (s.reduced) s.vx = 0
    const { min, max } = bounds()
    if (s.x > max || s.x < min) s.anchor = s.x > max ? max : min
    view.current?.releasePointerCapture(e.pointerId)
    kick()
  }

  const goTo = (dir: -1 | 1) => {
    const s = sim.current
    const { min, max, step } = bounds()
    const base = s.anchor ?? s.x
    const next = Math.max(min, Math.min(max, Math.round((base - dir * step) / step) * step))
    s.vx = 0
    if (s.reduced) {
      s.x = next
      if (track.current) track.current.style.transform = `translate3d(${next}px,0,0)`
      return
    }
    s.anchor = next
    s.vx = s.x === next ? 0 : (next - s.x) * 4 // dorongan awal agar ayunan terasa
    kick()
  }

  // Sentuh ringan pada foto: ayunkan sedikit.
  const nudge = (i: number, dir: number) => {
    const s = sim.current
    if (s.reduced) return
    s.av[i] = (s.av[i] ?? 0) + dir * 34
    kick()
  }

  if (photos.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={view}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') (e.preventDefault(), goTo(-1))
          else if (e.key === 'ArrowRight') (e.preventDefault(), goTo(1))
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative cursor-grab select-none overflow-hidden py-4 [touch-action:pan-y] active:cursor-grabbing"
        style={{ '--pw': 'clamp(10.5rem, 58vw, 14.5rem)', '--gap': 'clamp(1.25rem, 5vw, 2.25rem)' } as CSSProperties}
      >
        <div ref={track} className="flex w-max items-start gap-[var(--gap)] px-6 will-change-transform sm:px-10">
          {photos.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                wraps.current[i] = el
              }}
              className="relative w-[var(--pw)] shrink-0 pt-[1.35rem]"
            >
              {/* Tali: segmen menggantung dari pin ini ke pin berikutnya. */}
              {i === 0 && <span aria-hidden="true" className="absolute right-1/2 top-[1.15rem] h-px w-[100vw] bg-ink-muted/70" />}
              {i < photos.length - 1 ? (
                <svg aria-hidden="true" viewBox="0 0 100 22" preserveAspectRatio="none" className="absolute left-1/2 top-[1.15rem] h-[22px] w-[calc(100%+var(--gap))] overflow-visible">
                  <path d="M0 0.5 Q50 14 100 0.5" fill="none" stroke="var(--ink-muted)" strokeOpacity="0.7" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                </svg>
              ) : (
                <span aria-hidden="true" className="absolute left-1/2 top-[1.15rem] h-px w-[100vw] bg-ink-muted/70" />
              )}

              <PolaroidCard
                photo={p}
                index={i}
                onEnter={(dir) => nudge(i, dir)}
                setRef={(el) => {
                  cards.current[i] = el
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 text-xs text-ink-muted">
        <p aria-hidden="true">Geser atau seret untuk melihat foto lainnya</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => goTo(-1)} aria-label="Foto sebelumnya" className="flex size-10 items-center justify-center border border-line text-ink hover:border-brand">
            ←
          </button>
          <button type="button" onClick={() => goTo(1)} aria-label="Foto berikutnya" className="flex size-10 items-center justify-center border border-line text-ink hover:border-brand">
            →
          </button>
        </div>
      </div>
    </div>
  )
}

function PolaroidCard({ photo, index, onEnter, setRef }: { photo: Polaroid; index: number; onEnter: (dir: number) => void; setRef: (el: HTMLElement | null) => void }) {
  return (
    <figure
      ref={setRef}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter(index % 2 ? 1 : -1)}
      style={{ transformOrigin: '50% 0' }}
      className="relative border border-black/10 bg-[#fbfbfe] p-3 pb-14 shadow-[0_14px_28px_-12px_rgb(0_0_0/0.45)]"
    >
      {/* Jepitan */}
      <span aria-hidden="true" className="absolute -top-[1.15rem] left-1/2 z-10 h-7 w-3.5 -translate-x-1/2 border border-black/30 bg-brand">
        <span className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
      </span>

      <div className="aspect-square overflow-hidden bg-scrim">
        {photo.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.caption} draggable={false} className="skeleton size-full object-cover" />
        ) : (
          <div role="img" aria-label={photo.caption} className="flex size-full items-center justify-center bg-brand-soft/60 text-xs text-ink-muted">
            foto
          </div>
        )}
      </div>
      <figcaption className="absolute inset-x-3 bottom-3.5 truncate text-center font-serif text-[0.95rem] italic text-[#121212]">{photo.caption}</figcaption>
    </figure>
  )
}
