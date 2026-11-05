'use client'

import { type KeyboardEvent, useCallback, useEffect, useId, useMemo, useState } from 'react'

import { LAMBANG_PARTS, type LambangPart, type LambangShape } from '@/content/lambang'
import { pad } from '@/lib/format'

const STEP_MS = 4000
const HILITE = '#b4d6fe'
const UNDERLAY = '#121212'
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const MOVE = `0.36s ${EASE}`

type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number }

function boxOf(shape: LambangShape): Box {
  switch (shape.kind) {
    case 'ring': {
      const o = shape.r + shape.w / 2
      return { x: 50 - o, y: 50 - o, w: o * 2, h: o * 2, cx: 50, cy: 50 }
    }
    case 'circle':
      return { x: shape.cx - shape.r, y: shape.cy - shape.r, w: shape.r * 2, h: shape.r * 2, cx: shape.cx, cy: shape.cy }
    case 'box':
      return { x: shape.x, y: shape.y, w: shape.w, h: shape.h, cx: shape.x + shape.w / 2, cy: shape.y + shape.h / 2 }
  }
}

const KIND_LABEL = { ring: 'CINCIN', circle: 'LINGKARAN', box: 'AREA' } as const
const f1 = (n: number) => n.toFixed(1)

/** Jalur SVG evenodd untuk cincin (lubang di tengah): dipakai sebagai clipPath dan garis tepi. */
function ringPath(r: number, w: number) {
  const o = r + w / 2
  const i = r - w / 2
  const circle = (rad: number) => `M ${50 - rad} 50 a ${rad} ${rad} 0 1 0 ${rad * 2} 0 a ${rad} ${rad} 0 1 0 ${-rad * 2} 0 Z`
  return `${circle(o)} ${circle(i)}`
}

function Spot({ shape }: { shape: LambangShape }) {
  switch (shape.kind) {
    case 'ring':
      return <path d={ringPath(shape.r, shape.w)} fillRule="evenodd" clipRule="evenodd" />
    case 'circle':
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} />
    case 'box':
      return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={1.2} />
  }
}

/** Garis tepi tipis dan isian tint untuk "mask" segmentasi. */
function Mask({ shape }: { shape: LambangShape }) {
  const common = { fill: HILITE, fillOpacity: 0.13, className: 'lx-fade' }
  const edge = { fill: 'none', pathLength: 100, className: 'lx-draw', strokeLinejoin: 'round' as const }
  const two = (node: (w: number) => React.ReactNode) => (
    <>
      <g stroke={UNDERLAY} opacity={0.8}>{node(0.7)}</g>
      <g stroke={HILITE}>{node(0.24)}</g>
    </>
  )
  if (shape.kind === 'ring') {
    const d = ringPath(shape.r, shape.w)
    return (
      <>
        <path d={d} fillRule="evenodd" {...common} />
        {two((w) => (
          <path d={d} fillRule="evenodd" strokeWidth={w} {...edge} />
        ))}
      </>
    )
  }
  if (shape.kind === 'circle') {
    return (
      <>
        <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...common} />
        {two((w) => (
          <circle cx={shape.cx} cy={shape.cy} r={shape.r} strokeWidth={w} {...edge} />
        ))}
      </>
    )
  }
  return (
    <>
      <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={1.2} {...common} />
      {two((w) => (
        <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={1.2} strokeWidth={w} {...edge} />
      ))}
    </>
  )
}

/** Kotak pelacak ala detektor objek: bergeser mulus antar target, lengkap dengan label dan garis silang pusat. */
function Tracker({ box, label }: { box: Box; label: string }) {
  const corner = 2.6
  const pad2 = 0.9
  const x1 = box.x - pad2
  const y1 = box.y - pad2
  const x2 = box.x + box.w + pad2
  const y2 = box.y + box.h + pad2
  const move = { transition: `transform ${MOVE}` }
  const chipW = label.length * 1.5 + 3.4
  const chipY = y1 < -1 ? y2 + 0.8 : y1 - 4.2

  const Corner = ({ x, y, sx, sy }: { x: number; y: number; sx: number; sy: number }) => (
    <g style={{ transform: `translate(${x}px, ${y}px) scale(${sx}, ${sy})`, ...move }}>
      <path d={`M 0 ${corner} V 0 H ${corner}`} fill="none" stroke={UNDERLAY} strokeWidth={0.8} opacity={0.8} />
      <path d={`M 0 ${corner} V 0 H ${corner}`} fill="none" stroke={HILITE} strokeWidth={0.34} strokeLinecap="square" />
    </g>
  )

  return (
    <g pointerEvents="none">
      {/* garis silang pusat */}
      <line x1={-6} x2={106} y1={0} y2={0} stroke={HILITE} strokeWidth={0.1} strokeDasharray="0.8 1.2" opacity={0.5} style={{ transform: `translateY(${box.cy}px)`, ...move }} />
      <line y1={-6} y2={106} x1={0} x2={0} stroke={HILITE} strokeWidth={0.1} strokeDasharray="0.8 1.2" opacity={0.5} style={{ transform: `translateX(${box.cx}px)`, ...move }} />

      {/* bingkai tipis */}
      <g style={{ transform: `translate(${x1}px, ${y1}px)`, ...move }}>
        <rect x={0} y={0} rx={0.4} fill="none" stroke={HILITE} strokeWidth={0.14} opacity={0.7} style={{ width: x2 - x1, height: y2 - y1, transition: `width ${MOVE}, height ${MOVE}` }} />
      </g>
      <Corner x={x1} y={y1} sx={1} sy={1} />
      <Corner x={x2} y={y1} sx={-1} sy={1} />
      <Corner x={x1} y={y2} sx={1} sy={-1} />
      <Corner x={x2} y={y2} sx={-1} sy={-1} />

      {/* titik pusat */}
      <g style={{ transform: `translate(${box.cx}px, ${box.cy}px)`, ...move }}>
        <circle r={0.55} fill={HILITE} />
        <circle r={1.5} fill="none" stroke={HILITE} strokeWidth={0.14} opacity={0.8} />
      </g>

      {/* label */}
      <g style={{ transform: `translate(${Math.max(-4, x1)}px, ${chipY}px)`, ...move }}>
        <rect x={0} y={0} height={3.5} rx={0.5} fill={HILITE} style={{ width: chipW, transition: `width ${MOVE}` }} />
        <text x={1.5} y={2.45} fontSize={2.05} fontFamily="ui-monospace, Menlo, monospace" fontWeight={600} fill={UNDERLAY} letterSpacing={0.15}>
          {label}
        </text>
      </g>
    </g>
  )
}

/**
 * Penjelajah lambang bergaya computer vision: klik lambang, lalu pelacak bergeser antar unsur seperti
 * detektor objek, dengan mask segmentasi, garis silang, dan panel keterangan. Angka koordinat adalah
 * geometri sorotan yang sebenarnya, bukan metrik rekaan. Tanpa pustaka luar; gerak mengikuti
 * `prefers-reduced-motion`.
 */
export function LogoExplorer() {
  const parts = LAMBANG_PARTS
  const uid = useId().replace(/:/g, '')
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
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

  const part: LambangPart = parts[index]
  const box = boxOf(part.shape)
  const clipId = `lx-clip-${uid}`
  const gridId = `lx-grid-${uid}`
  const ticks = useMemo(() => Array.from({ length: 96 }, (_, i) => i), [])
  const atEnd = index === parts.length - 1 && !playing
  const label = `${pad(index + 1)} ${part.short.toUpperCase()}`

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
          {/* Kilau melintas di atas lambang saat penelusuran tidak berjalan (cakram = 100/116 lebar SVG). */}
          {!active && <span className="shine-overlay" aria-hidden="true" style={{ inset: '6.9%' }} />}
          <svg viewBox="-8 -8 116 116" className="block w-full overflow-visible" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <Spot shape={part.shape} />
              </clipPath>
              <clipPath id={`${clipId}-disc`}>
                <circle cx={50} cy={50} r={50} />
              </clipPath>
              <pattern id={gridId} width={5} height={5} patternUnits="userSpaceOnUse">
                <circle cx={2.5} cy={2.5} r={0.22} fill={HILITE} />
              </pattern>
            </defs>

            {/* Skala tepi (HUD) */}
            {active && (
              <g className="lx-fade">
                <g className="lx-tick text-ink-muted" stroke="currentColor">
                  {ticks.map((i) => {
                    const a = (i / ticks.length) * Math.PI * 2
                    const long = i % 8 === 0
                    const r1 = 52.6
                    const r2 = long ? 55.4 : 54
                    return (
                      <line
                        key={i}
                        x1={50 + Math.cos(a) * r1}
                        y1={50 + Math.sin(a) * r1}
                        x2={50 + Math.cos(a) * r2}
                        y2={50 + Math.sin(a) * r2}
                        strokeWidth={long ? 0.3 : 0.14}
                      />
                    )
                  })}
                </g>
              </g>
            )}

            {/* Lapis dasar: meredup saat aktif */}
            <image
              href="/brand/hmti-logo.webp"
              x={0}
              y={0}
              width={100}
              height={100}
              style={{ filter: active ? 'brightness(0.34) saturate(0.75)' : undefined, transition: 'filter 0.45s ease' }}
              className={active ? '' : 'transition-transform duration-500 group-hover:scale-[1.02]'}
            />

            {active && (
              <>
                {/* Kisi titik tipis di atas lambang */}
                <g clipPath={`url(#${clipId}-disc)`} opacity={0.5} className="lx-fade">
                  <rect x={0} y={0} width={100} height={100} fill={`url(#${gridId})`} />
                </g>

                {/* Sorotan terang sesuai bentuk target, berganti dengan crossfade cepat */}
                <g key={`${run}-${index}`}>
                  <g clipPath={`url(#${clipId})`} className="lx-fade">
                    <image href="/brand/hmti-logo.webp" x={0} y={0} width={100} height={100} />
                  </g>
                  <Mask shape={part.shape} />
                </g>

                <Tracker box={box} label={label} />
              </>
            )}

            {/* Garis pindai sekali saat sesi mulai */}
            {active && !reduced && (
              <g key={`scan-${run}`} clipPath={`url(#${clipId}-disc)`} style={{ pointerEvents: 'none' }}>
                <rect x={0} y={0} width={100} height={0.5} fill={HILITE} className="lx-scan" opacity={0.85} />
                <rect x={0} y={-5} width={100} height={5} fill={HILITE} fillOpacity={0.14} className="lx-scan" />
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
              className="mt-6 inline-flex h-11 items-center rounded-control bg-brand px-5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-strong"
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

            <div className="mt-1 h-px w-full bg-line" aria-hidden="true">
              <div className="h-full bg-link transition-[width] duration-300" style={{ width: `${((index + 1) / parts.length) * 100}%` }} />
            </div>

            <div key={index} className="lx-rise mt-6 min-h-52" aria-live="polite">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-link">Unsur {index + 1}</p>
              <h3 className="mt-2 font-serif text-4xl italic leading-[1.1] sm:text-5xl">{part.name}</h3>
              <p className="mt-4 max-w-md text-lg text-ink-muted">{part.meaning}</p>
              <dl className="mt-5 grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-4 font-mono text-xs text-ink-muted">
                <dt>BENTUK</dt>
                <dd className="text-ink">{KIND_LABEL[part.shape.kind]}</dd>
                <dt>PUSAT</dt>
                <dd className="text-ink">
                  {f1(box.cx)}, {f1(box.cy)}
                </dd>
                <dt>UKURAN</dt>
                <dd className="text-ink">
                  {f1(box.w)} × {f1(box.h)}
                </dd>
              </dl>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Pilih unsur lambang">
              {parts.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === index ? 'step' : undefined}
                    className={`flex h-11 w-full items-center gap-2 rounded-control border px-3 text-left text-sm transition-colors duration-200 ${
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
                className="flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink-muted"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => (atEnd ? (setIndex(0), setPlaying(true)) : setPlaying((p) => !p))}
                className="flex h-11 items-center rounded-control border border-line px-4 text-sm transition-colors hover:border-ink-muted"
              >
                {atEnd ? 'Ulangi' : playing ? 'Jeda' : 'Putar otomatis'}
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Unsur berikutnya"
                className="flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink-muted"
              >
                →
              </button>
              <button type="button" onClick={stop} className="ml-auto flex h-11 items-center rounded-control px-3 text-sm text-ink-muted transition-colors hover:text-ink">
                Keluar
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Panah kiri/kanan berpindah unsur, Esc untuk keluar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
