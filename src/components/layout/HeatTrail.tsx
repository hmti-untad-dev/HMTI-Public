'use client'

import { useEffect, useRef } from 'react'

const CELL = 8 // px, sel kisi
const RADIUS = 2 // sel di sekitar kursor yang ikut memanas (kecil)
const DECAY = 0.9
const STOPS: [number, number, number][] = [
  [62, 64, 148], // biru HMTI (dingin)
  [94, 200, 255], // cyan
  [255, 210, 63], // kuning
  [255, 138, 42], // jingga
  [255, 77, 77], // merah (panas)
]

function thermal(t: number): string {
  const x = Math.min(0.999, Math.max(0, t)) * (STOPS.length - 1)
  const i = Math.floor(x)
  const f = x - i
  const [a, b] = [STOPS[i], STOPS[i + 1]]
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)} ${Math.round(a[1] + (b[1] - a[1]) * f)} ${Math.round(a[2] + (b[2] - a[2]) * f)})`
}

/**
 * Jejak kursor "thermodynamic grid": sel-sel kecil di sekitar kursor memanas (makin cepat kursor, makin panas),
 * lalu mendingin dan sedikit menyebar ke tetangganya seperti kamera termal. Kanvas tetap di atas halaman tanpa
 * menangkap klik. Hemat: hanya kotak area yang aktif yang dihitung dan digambar, rAF berhenti saat semua dingin,
 * hanya untuk mouse, dan mati bila pengguna memilih gerak dikurangi.
 */
export function HeatTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let heat = new Float32Array(0)
    let next = new Float32Array(0)
    let box = { x0: 0, y0: 0, x1: -1, y1: -1 } // area aktif (sel)
    let raf = 0
    let last = { x: 0, y: 0, t: 0 }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = window.innerWidth * dpr
      cv.height = window.innerHeight * dpr
      cv.style.width = `${window.innerWidth}px`
      cv.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(window.innerWidth / CELL)
      rows = Math.ceil(window.innerHeight / CELL)
      heat = new Float32Array(cols * rows)
      next = new Float32Array(cols * rows)
      box = { x0: 0, y0: 0, x1: -1, y1: -1 }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }

    const frame = () => {
      raf = 0
      if (box.x1 < box.x0) return
      // Area yang digambar ulang: kotak aktif + 1 sel tepi untuk penyebaran.
      const x0 = Math.max(0, box.x0 - 1)
      const y0 = Math.max(0, box.y0 - 1)
      const x1 = Math.min(cols - 1, box.x1 + 1)
      const y1 = Math.min(rows - 1, box.y1 + 1)
      let nx0 = cols
      let ny0 = rows
      let nx1 = -1
      let ny1 = -1
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * cols + x
          // Penyebaran ringan: rata-rata dengan tetangga (difusi), lalu pendinginan.
          const n = (heat[i - 1] ?? 0) * (x > 0 ? 1 : 0) + (x < cols - 1 ? heat[i + 1] : 0) + (y > 0 ? heat[i - cols] : 0) + (y < rows - 1 ? heat[i + cols] : 0)
          const v = (heat[i] * 0.8 + n * 0.05) * DECAY
          next[i] = v < 0.02 ? 0 : v
          if (next[i] > 0) {
            if (x < nx0) nx0 = x
            if (x > nx1) nx1 = x
            if (y < ny0) ny0 = y
            if (y > ny1) ny1 = y
          }
        }
      }
      ctx.clearRect(x0 * CELL, y0 * CELL, (x1 - x0 + 1) * CELL, (y1 - y0 + 1) * CELL)
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * cols + x
          heat[i] = next[i]
          const v = heat[i]
          if (v <= 0) continue
          ctx.globalAlpha = Math.min(0.6, v * 0.6)
          ctx.fillStyle = thermal(v)
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
        }
      }
      ctx.globalAlpha = 1
      box = { x0: nx0, y0: ny0, x1: nx1, y1: ny1 }
      if (nx1 >= nx0) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const now = performance.now()
      const speed = Math.min(1, Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(8, now - last.t) / 1.6)
      last = { x: e.clientX, y: e.clientY, t: now }
      const cx = Math.floor(e.clientX / CELL)
      const cy = Math.floor(e.clientY / CELL)
      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = cx + dx
          const y = cy + dy
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue
          const fall = 1 - Math.hypot(dx, dy) / (RADIUS + 1)
          if (fall <= 0) continue
          const i = y * cols + x
          heat[i] = Math.min(1, heat[i] + fall * (0.25 + speed * 0.55))
          if (box.x1 < box.x0) box = { x0: x, y0: y, x1: x, y1: y }
          else box = { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x), y1: Math.max(box.y1, y) }
        }
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="heat-trail" />
}
