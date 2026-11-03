'use client'

import { type KeyboardEvent, useCallback, useEffect, useId, useMemo, useState } from 'react'

import { LAMBANG_PARTS, type LambangPart, type LambangShape } from '@/content/lambang'
import { pad } from '@/lib/format'

const STEP_MS = 6500
const HILITE = '#b4d6fe'
const UNDERLAY = '#121212'

/** Jalur SVG evenodd untuk cincin (lubang di tengah) agar bisa dipakai sebagai clipPath & isian. */
function ringPath(r: number, w: number) {
  const o = r + w / 2
  const i = r - w / 2
  const circle = (rad: number) => `M ${50 - rad} 50 a ${rad} ${rad} 0 1 0 ${rad * 2} 0 a ${rad} ${rad} 0 1 0 ${-rad * 2} 0 Z`
  return `${circle(o)} ${circle(i)}`
}

function Spot({ shape, pathId }: { shape: LambangShape; pathId: string }) {
  switch (shape.kind) {
    case 'ring':
      return <path id={pathId} d={ringPath(shape.r, shape.w)} fillRule="evenodd" clipRule="evenodd" />
    case 'circle':
      return <circle id={pathId} cx={shape.cx} cy={shape.cy} r={shape.r} />
    case 'box':
      return <rect id={pathId} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={2} />
  }
}

/** Garis bidik di sekeliling target: lengkung bergambar-sendiri untuk cincin, siku-siku untuk kotak, silang untuk lingkaran. */
function Reticle({ part }: { part: LambangPart }) {
  const { shape } = part
  const line = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const layers = (children: (c: string, w: number) => React.ReactNode) => (
    <>
      <g stroke={UNDERLAY} opacity={0.85}>{children(UNDERLAY, 1.5)}</g>
      <g stroke={HILITE}>{children(HILITE, 0.55)}</g>
    </>
  )

  if (shape.kind === 'ring') {
    const d = ringPath(shape.r, shape.w)
    return (
      <>
        <path d={d} fillRule="evenodd" fill={HILITE} fillOpacity={0.16} className="lx-fade" />
        {layers((_, w) => (
          <path d={d} fillRule="evenodd" pathLength={100} strokeWidth={w} className="lx-draw" {...line} />
        ))}
      </>
    )
  }

  if (shape.kind === 'circle') {
    const { cx, cy, r } = shape
    const t = r + 2.2
    return (
      <>
        <circle cx={cx} cy={cy} r={r} fill={HILITE} fillOpacity={0.16} className="lx-fade" />
        {layers((_, w) => (
          <>
            <circle cx={cx} cy={cy} r={r} pathLength={100} strokeWidth={w} className="lx-draw" {...line} />
            <path
              d={`M ${cx - t} ${cy} h 1.8 M ${cx + t - 1.8} ${cy} h 1.8 M ${cx} ${cy - t} v 1.8 M ${cx} ${cy + t - 1.8} v 1.8`}
              strokeWidth={w}
              className="lx-pop"
              {...line}
            />
          </>
        ))}
      </>
    )
  }

  const { x, y, w: bw, h: bh } = shape
  const k = Math.min(3, bw / 3, bh / 3)
  const pad2 = 1.2
  const [x1, y1, x2, y2] = [x - pad2, y - pad2, x + bw + pad2, y + bh + pad2]
  const d = `M ${x1} ${y1 + k} V ${y1} H ${x1 + k} M ${x2 - k} ${y1} H ${x2} V ${y1 + k} M ${x2} ${y2 - k} V ${y2} H ${x2 - k} M ${x1 + k} ${y2} H ${x1} V ${y2 - k}`
  return (
    <>
      <rect x={x} y={y} width={bw} height={bh} rx={2} fill={HILITE} fillOpacity={0.14} className="lx-fade" />
      {layers((_, w) => (
        <path d={d} strokeWidth={w} className="lx-pop" {...line} />
      ))}
    </>
  )
}

/**
 * Penjelajah lambang: klik lambang untuk memulai penelusuran. Tiap unsur disorot (sorotan terang di atas
 * gambar yang diredupkan) dan dijelaskan di panel. Bisa otomatis, dijeda, atau dipilih manual.
 * Tanpa pustaka luar; gerak mengikuti `prefers-reduced-motion`.
 */
export function LogoExplorer() {
  const parts = LAMBANG_PARTS
  const uid = useId().replace(/:/g, '')
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0) // naik tiap sesi baru agar animasi pindai diputar ulang
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const start = useCallback(() => {
    setActive(true)
    setIndex(0)
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setRun((n) => n + 1)
  }, [])

  const stop = useCallback(() => {
    setActive(false)
    setPlaying(false)
  }, [])

  const go = useCallback(
    (i: number) => {
      setIndex(((i % parts.length) + parts.length) % parts.length)
      setPlaying(false)
    },
    [parts.length],
  )

  useEffect(() => {
    if (!active || !playing) return
    const id = window.setTimeout(() => {
      if (index >= parts.length - 1) setPlaying(false)
      else setIndex(index + 1)
    }, STEP_MS)
    return () => window.clearTimeout(id)
  }, [active, playing, index, parts.length])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!active) return
    if (e.key === 'ArrowRight') go(index + 1)
    else if (e.key === 'ArrowLeft') go(index - 1)
    else if (e.key === 'Escape') stop()
  }

  const part = parts[index]
  const clipId = `lx-clip-${uid}`
  const spotId = `lx-spot-${uid}`
  const ticks = useMemo(() => Array.from({ length: 72 }, (_, i) => i), [])
  const atEnd = index === parts.length - 1 && !playing

  return (
    <div onKeyDown={onKeyDown} className="grid items-center gap-10 lg:grid-cols-[minmax(0,34rem)_1fr]">
      {/* Panggung lambang */}
      <div className="relative mx-auto w-full max-w-[32rem]">
        <button
          type="button"
          onClick={active ? undefined : start}
          disabled={active}
          aria-label={active ? 'Lambang HMTI UNTAD (penelusuran berjalan)' : 'Mulai penelusuran makna lambang HMTI UNTAD'}
          className={`group block w-full rounded-full focus-visible:outline-offset-8 ${active ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <svg viewBox="-6 -6 112 112" className="block w-full overflow-visible" role="img" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <Spot shape={part.shape} pathId={spotId} />
              </clipPath>
              <clipPath id={`${clipId}-disc`}>
                <circle cx={50} cy={50} r={50} />
              </clipPath>
            </defs>

            {/* Cincin tanda HUD hanya saat aktif */}
            {active && (
              <g className="lx-fade">
                <g className="lx-tick text-ink-muted" stroke="currentColor">
                  {ticks.map((i) => {
                    const a = (i / ticks.length) * Math.PI * 2
                    const long = i % 6 === 0
                    const r1 = 53.2
                    const r2 = long ? 56 : 54.6
                    return (
                      <line
                        key={i}
                        x1={50 + Math.cos(a) * r1}
                        y1={50 + Math.sin(a) * r1}
                        x2={50 + Math.cos(a) * r2}
                        y2={50 + Math.sin(a) * r2}
                        strokeWidth={long ? 0.45 : 0.25}
                      />
                    )
                  })}
                </g>
              </g>
            )}

            {/* Lapis dasar: redup saat aktif */}
            <image
              href="/brand/hmti-logo.webp"
              x={0}
              y={0}
              width={100}
              height={100}
              style={{ filter: active ? 'brightness(0.38) saturate(0.8)' : undefined, transition: 'filter 0.5s ease' }}
              className={active ? '' : 'transition-transform duration-500 group-hover:scale-[1.02]'}
            />

            {active && (
              <g key={`${run}-${index}`}>
                {/* Sorotan: salinan terang yang dipotong sesuai bentuk target */}
                <g clipPath={`url(#${clipId})`} className="lx-fade">
                  <image href="/brand/hmti-logo.webp" x={0} y={0} width={100} height={100} />
                </g>
                <Reticle part={part} />
              </g>
            )}

            {/* Garis pindai sekali saat sesi mulai */}
            {active && !reduced && (
              <g key={`scan-${run}`} clipPath={`url(#${clipId}-disc)`} style={{ pointerEvents: 'none' }}>
                <rect x={0} y={0} width={100} height={1.6} fill={HILITE} className="lx-scan" opacity={0.9} />
                <rect x={0} y={-6} width={100} height={6} fill={HILITE} fillOpacity={0.18} className="lx-scan" />
              </g>
            )}
          </svg>
        </button>

        {!active && (
          <p className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center">
            <span className="rounded-full border border-line bg-surface-raised px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              Klik lambang
            </span>
          </p>
        )}
      </div>

      {/* Panel keterangan */}
      <div className="min-w-0">
        {!active ? (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">AD/ART Pasal 4 · Lambang</p>
            <h3 className="mt-3 font-serif text-4xl italic leading-[1.1] sm:text-5xl">Delapan unsur, satu makna.</h3>
            <p className="mt-4 max-w-md text-ink-muted">
              Setiap bagian lambang HMTI UNTAD menyimpan arti. Klik lambang untuk menelusurinya satu per satu.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 inline-flex h-11 items-center rounded-control bg-brand px-5 text-sm font-medium text-on-brand hover:bg-brand-strong"
            >
              Mulai penelusuran
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">
              <span>Penelusuran lambang</span>
              <span aria-hidden="true">
                {pad(index + 1)} / {pad(parts.length)}
              </span>
            </div>

            <div className="mt-1 h-0.5 w-full bg-line" aria-hidden="true">
              <div
                className="h-full bg-link transition-[width] duration-500"
                style={{ width: `${((index + 1) / parts.length) * 100}%` }}
              />
            </div>

            <div key={index} className="lx-rise mt-6 min-h-44" aria-live="polite">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-link">Unsur {index + 1}</p>
              <h3 className="mt-2 font-serif text-4xl italic leading-[1.1] sm:text-5xl">{part.name}</h3>
              <p className="mt-4 max-w-md text-lg text-ink-muted">{part.meaning}</p>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Pilih unsur lambang">
              {parts.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === index ? 'step' : undefined}
                    className={`flex h-11 w-full items-center gap-2 rounded-control border px-3 text-left text-sm transition-colors ${
                      i === index ? 'border-brand bg-brand text-on-brand' : 'border-line text-ink hover:border-ink-muted'
                    }`}
                  >
                    <span className="font-mono text-xs opacity-70">{pad(i + 1)}</span>
                    <span className="truncate">{p.short}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Unsur sebelumnya"
                className="flex size-11 items-center justify-center rounded-full border border-line hover:border-ink-muted"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => (atEnd ? (setIndex(0), setPlaying(true)) : setPlaying((p) => !p))}
                className="flex h-11 items-center rounded-control border border-line px-4 text-sm hover:border-ink-muted"
              >
                {atEnd ? 'Ulangi' : playing ? 'Jeda' : 'Putar otomatis'}
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Unsur berikutnya"
                className="flex size-11 items-center justify-center rounded-full border border-line hover:border-ink-muted"
              >
                →
              </button>
              <button
                type="button"
                onClick={stop}
                className="ml-auto flex h-11 items-center rounded-control px-3 text-sm text-ink-muted hover:text-ink"
              >
                Keluar
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Tombol panah kiri/kanan berpindah unsur, Esc untuk keluar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
