'use client'

import { useEffect, useRef } from 'react'

import { PixelPortrait } from '../ui/PixelPortrait'

export type ChairCard = { id: number; name: string; year: number; cabinetName: string | null; photoUrl: string | null; poster: boolean; current: boolean; empty: boolean }

/**
 * Slider para Ketua Umum dari periode ke periode. Gulir-geser native (scroll-snap) supaya mulus di HP dan ringan,
 * ditambah tombol panah dan tombol keyboard kiri/kanan. Potret memakai efek piksel yang sama dengan halaman Kepengurusan.
 */
export function ChairSlider({ chairs }: { chairs: ChairCard[] }) {
  const track = useRef<HTMLUListElement>(null)

  // Mulai dari periode terbaru (ujung kanan): yang paling relevan untuk pengunjung.
  useEffect(() => {
    const t = track.current
    if (t) t.scrollLeft = t.scrollWidth
  }, [])
  const by = (dir: -1 | 1) => {
    const t = track.current
    if (!t) return
    const card = t.querySelector<HTMLElement>('li')
    t.scrollBy({ left: dir * ((card?.offsetWidth ?? 220) + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <div>
      <ul
        ref={track}
        tabIndex={0}
        aria-label="Ketua Umum HMTI UNTAD dari periode ke periode"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') (e.preventDefault(), by(1))
          if (e.key === 'ArrowLeft') (e.preventDefault(), by(-1))
        }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
        data-lenis-prevent-horizontal
      >
        {chairs.map((c) => (
          <li key={c.id} className="w-36 shrink-0 snap-start sm:w-40">
            <figure data-tilt={c.empty ? undefined : true}>
              {c.empty ? (
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-line bg-surface-raised text-ink-muted">
                  <span className="font-mono text-3xl">?</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">foto menyusul</span>
                </div>
              ) : (
                <div className="relative aspect-[4/5] overflow-hidden border border-line bg-scrim">
                  <PixelPortrait src={c.photoUrl} name={c.name} tag={`KETUA_${c.year}`} />
                  {c.current && (
                    <span className="absolute bottom-2 right-2 bg-link px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-surface">Saat ini</span>
                  )}
                </div>
              )}
              <figcaption className="mt-2.5">
                <p className="font-mono text-xl font-bold tracking-tight text-link">{c.year}</p>
                <p className={`text-sm font-semibold leading-tight ${c.empty ? 'text-ink-muted' : ''}`}>{c.name}</p>
                <p className="text-xs text-ink-muted">Ketua Umum{c.cabinetName ? ` · ${c.cabinetName}` : ''}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {chairs.length > 1 && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => by(-1)} aria-label="Ketua Umum sebelumnya" className="flex size-10 items-center justify-center border border-line hover:border-brand">
            ←
          </button>
          <button type="button" onClick={() => by(1)} aria-label="Ketua Umum berikutnya" className="flex size-10 items-center justify-center border border-line hover:border-brand">
            →
          </button>
        </div>
      )}
    </div>
  )
}
