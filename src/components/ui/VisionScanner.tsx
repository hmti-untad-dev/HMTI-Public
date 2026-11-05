'use client'

import { useEffect, useRef, useState } from 'react'

export type ScanObject = {
  /** Nama objek yang tampil di label, mis. "papan nama". */
  label: string
  /** Skor keyakinan fiktif untuk gaya konsol, 0..1. */
  score: number
  /** Kotak dalam persen gambar: x, y, lebar, tinggi. */
  box: [number, number, number, number]
}

type Props = {
  src: string
  alt: string
  width: number
  height: number
  objects: ScanObject[]
  caption?: string
}

type Rect = { x: number; y: number; w: number; h: number }

const FREE = 16 // ukuran kotak bebas (persen lebar panel) saat kursor tidak di atas objek

/**
 * Panel "computer vision" (dipakai di bagian Tentang beranda). Foto dirender biasa (langsung terlihat, aman untuk LCP); di atasnya
 * kotak deteksi dan satu kotak bidik yang:
 * - mengikuti kursor dengan pegas dan mengunci ke objek yang ditunjuk (perangkat dengan mouse);
 * - berpindah sendiri antar objek (layar sentuh, keyboard, atau saat kursor diam di luar panel).
 * Gerak dihitung dengan rAF dan hanya berjalan selama ada perubahan. Gerak dikurangi = kotak diam pada objek pertama.
 */
export function VisionScanner({ src, alt, width, height, objects, caption }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const reticle = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(objects.length ? 0 : null)
  const [coord, setCoord] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = panel.current
    const box = reticle.current
    if (!el || !box) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const ratio = height / width

    const toRect = (i: number): Rect => {
      const [x, y, w, h] = objects[i].box
      return { x, y, w, h }
    }
    let target: Rect = objects.length ? toRect(0) : { x: 50 - FREE / 2, y: 50 - FREE / 2 / ratio, w: FREE, h: FREE / ratio }
    const cur: Rect = { ...target }
    let raf = 0
    let auto = 0
    let pointerInside = false
    let lastIdx: number | null = objects.length ? 0 : null

    const paint = () => {
      box.style.transform = `translate(${cur.x}cqw, ${cur.y * ratio}cqw)`
      box.style.width = `${cur.w}cqw`
      box.style.height = `${cur.h * ratio}cqw`
    }
    paint()

    const step = () => {
      let moving = false
      for (const k of ['x', 'y', 'w', 'h'] as const) {
        const d = target[k] - cur[k]
        if (Math.abs(d) > 0.05) {
          cur[k] += d * 0.2
          moving = true
        } else cur[k] = target[k]
      }
      paint()
      raf = moving ? requestAnimationFrame(step) : 0
    }
    const kick = () => {
      if (reduced) {
        Object.assign(cur, target)
        paint()
        return
      }
      if (!raf) raf = requestAnimationFrame(step)
    }

    const lockTo = (i: number | null) => {
      if (i === lastIdx) return
      lastIdx = i
      setActive(i)
    }

    // Autopilot hanya berjalan saat panel terlihat (hemat CPU di luar layar).
    let onScreen = false
    const vis = new IntersectionObserver(([en]) => (onScreen = en.isIntersecting))
    vis.observe(el)

    // Autopilot: berpindah antar objek setiap 1,8 detik.
    const startAuto = () => {
      if (reduced || objects.length < 2 || auto) return
      auto = window.setInterval(() => {
        if (pointerInside || document.hidden || !onScreen) return
        const next = ((lastIdx ?? -1) + 1) % objects.length
        target = toRect(next)
        lockTo(next)
        setCoord(null)
        kick()
      }, 1800)
    }
    const stopAuto = () => {
      window.clearInterval(auto)
      auto = 0
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = ((e.clientX - r.left) / r.width) * 100
      const py = ((e.clientY - r.top) / r.height) * 100
      // Objek terkecil yang memuat titik kursor menang (papan nama di dalam gedung).
      let hit: number | null = null
      let best = Infinity
      objects.forEach((o, i) => {
        const [x, y, w, h] = o.box
        if (px >= x && px <= x + w && py >= y && py <= y + h && w * h < best) {
          best = w * h
          hit = i
        }
      })
      if (hit !== null) {
        target = toRect(hit)
        setCoord(null)
      } else {
        const h = FREE / ratio
        target = { x: Math.min(100 - FREE, Math.max(0, px - FREE / 2)), y: Math.min(100 - h, Math.max(0, py - h / 2)), w: FREE, h }
        setCoord({ x: px / 100, y: py / 100 })
      }
      lockTo(hit)
      kick()
    }
    const onEnter = () => {
      pointerInside = true
    }
    const onLeave = () => {
      pointerInside = false
      setCoord(null)
      if (objects.length) {
        const i = lastIdx ?? 0
        target = toRect(i)
        lockTo(i)
        kick()
      }
    }

    if (finePointer && !reduced) {
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointerleave', onLeave)
    }
    startAuto()

    return () => {
      cancelAnimationFrame(raf)
      stopAuto()
      vis.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [objects, width, height])

  const current = active !== null ? objects[active] : null
  const tag = current ? `${current.label} ${current.score.toFixed(2)}` : coord ? `x ${coord.x.toFixed(2)} · y ${coord.y.toFixed(2)}` : 'memindai'

  return (
    <figure className="scanner">
      <div className="scanner-bar" aria-hidden="true">
        <span>hmti-vision</span>
        <span>{objects.length ? `${objects.length} objek` : 'siap'}</span>
      </div>
      <div ref={panel} className="scanner-view">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="scanner-img" />
        <div className="scanner-layer" aria-hidden="true">
          {objects.map((o, i) => (
            <span
              key={o.label}
              className="scanner-obj"
              data-on={i === active}
              style={{ left: `${o.box[0]}%`, top: `${o.box[1]}%`, width: `${o.box[2]}%`, height: `${o.box[3]}%`, ['--d' as string]: `${o.box[1] * 12}ms` }}
            />
          ))}
          <div ref={reticle} className="scanner-reticle">
            <span className="scanner-tag">{tag}</span>
          </div>
          <span className="scanner-sweep" />
        </div>
      </div>
      <figcaption className="scanner-foot">
        <span aria-hidden="true">&gt; {current ? `terkunci: ${current.label}` : 'arahkan kursor ke foto'}</span>
        {caption && <span className="scanner-cap">{caption}</span>}
      </figcaption>
    </figure>
  )
}

/**
 * Objek yang "terdeteksi" pada foto gedung Laboratorium Informatika (public/brand/lab-informatika.webp, 611x348),
 * dalam persen gambar: [x, y, lebar, tinggi].
 */
export const LAB_OBJECTS: ScanObject[] = [
  { label: 'papan nama', score: 0.99, box: [64.5, 39, 11, 7.5] },
  { label: 'lambang', score: 0.98, box: [68, 32.5, 4, 7] },
  { label: 'pintu masuk', score: 0.96, box: [65.5, 61, 11.5, 23] },
  { label: 'jendela', score: 0.93, box: [22.5, 32, 10.5, 16] },
  { label: 'tanaman', score: 0.91, box: [35, 59, 17.5, 27] },
  { label: 'gedung', score: 0.97, box: [1, 13, 91, 73] },
]
