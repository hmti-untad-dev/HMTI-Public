'use client'

import { useEffect, useRef } from 'react'

type Props = { text: string }

const SOLID = '#%@&'
const FIELD = '@%#*+=-:.'
const NOISE = '01<>/{}[]#$%&*+=?'
const COLS = ['A', 'B', 'C', 'D', 'E', 'F']

const hash = (a: number, b: number, s = 0) => {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) >>> 0
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

/**
 * Wordmark ASCII di kanvas. Kursor menjadi "sasaran": garis silang + penunjuk sel (A1..F6) + koordinat,
 * dan huruf di sekitarnya teracak serta menyala. Gambar hanya berjalan selama kursor aktif (hemat CPU).
 * Warna diambil dari token tema; gerak mati bila pengguna memilih gerak dikurangi.
 */
export function AsciiWordmark({ text }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    if (!el || !cv) return
    const ctx = cv.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let cell = 9
    let cols = 0
    let rows = 0
    let lit = new Uint8Array(0)
    const top = 22
    const ptr = { x: 0, y: 0, inside: false }
    let energy = 0
    let raf = 0
    let colors = { ink: '#fff', link: '#b4d6fe', muted: '#999', line: '#333' }

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d
      colors = { ink: v('--ink', '#fff'), link: v('--link', '#b4d6fe'), muted: v('--ink-muted', '#999'), line: v('--line', '#333') }
    }

    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = el.clientWidth
      h = Math.round(Math.min(360, Math.max(190, w * 0.27)))
      cv.width = w * dpr
      cv.height = h * dpr
      cv.style.width = `${w}px`
      cv.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cell = w < 520 ? 6 : w < 900 ? 8 : 10
      cols = Math.floor(w / cell)
      rows = Math.floor((h - top) / cell)

      // Rasterisasi teks ke kanvas luring, lalu ambil sampel per sel.
      const off = document.createElement('canvas')
      off.width = cols * 4
      off.height = rows * 4
      const o = off.getContext('2d', { willReadFrequently: true })!
      const family = '900 100px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
      o.font = family
      const mw = o.measureText(text).width || 1
      const fs = Math.min((100 * off.width * 0.96) / mw, off.height * 0.92)
      o.font = family.replace('100px', `${fs}px`)
      o.textAlign = 'center'
      o.textBaseline = 'middle'
      o.fillStyle = '#000'
      o.fillText(text, off.width / 2, off.height / 2 + fs * 0.04)
      const data = o.getImageData(0, 0, off.width, off.height).data
      lit = new Uint8Array(cols * rows)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let a = 0
          for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) a += data[((r * 4 + dy) * off.width + c * 4 + dx) * 4 + 3]
          lit[r * cols + c] = a / 16 > 110 ? 1 : 0
        }
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.font = `${Math.round(cell * 1.15)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const R = Math.min(150, w * 0.22)
      const tick = Math.floor(time / 90)

      // Kisi sel A1..F6 di tepi atas
      ctx.strokeStyle = colors.line
      ctx.fillStyle = colors.muted
      ctx.lineWidth = 1
      ctx.font = '10px ui-monospace, Menlo, monospace'
      ctx.textAlign = 'left'
      for (let i = 0; i < COLS.length; i++) {
        const x = Math.round((i * w) / COLS.length) + 0.5
        ctx.beginPath()
        ctx.moveTo(x, 4)
        ctx.lineTo(x, 14)
        ctx.stroke()
        ctx.fillText(`${COLS[i]}${i + 1}`, x + 5, 11)
      }
      ctx.font = `${Math.round(cell * 1.15)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textAlign = 'center'

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cell + cell / 2
          const y = top + r * cell + cell / 2
          const on = lit[r * cols + c] === 1
          const dx = x - ptr.x
          const dy = y - ptr.y
          const near = energy > 0.01 ? Math.max(0, 1 - Math.hypot(dx, dy) / R) * energy : 0
          const k = near * near

          if (on) {
            if (k > 0.02) {
              const g = NOISE[Math.floor(hash(c, r, tick) * NOISE.length)]
              ctx.fillStyle = colors.link
              ctx.globalAlpha = 0.55 + 0.45 * k
              ctx.fillText(g, x + (hash(c, r, tick + 7) - 0.5) * k * 4, y + (hash(c, r, tick + 3) - 0.5) * k * 4)
            } else {
              ctx.fillStyle = colors.ink
              ctx.globalAlpha = 0.92
              ctx.fillText(SOLID[Math.floor(hash(c, r) * SOLID.length)], x, y)
            }
          } else if (k > 0.04) {
            const idx = Math.min(FIELD.length - 1, Math.floor((1 - k) * FIELD.length))
            ctx.fillStyle = colors.link
            ctx.globalAlpha = Math.min(0.85, k * 1.1)
            ctx.fillText(FIELD[idx], x, y)
          } else if (hash(c, r, 5) < 0.045) {
            ctx.fillStyle = colors.muted
            ctx.globalAlpha = 0.28
            ctx.fillText('.', x, y)
          }
        }
      }
      ctx.globalAlpha = 1

      // Sasaran kursor
      if (energy > 0.02) {
        const a = Math.min(1, energy)
        ctx.strokeStyle = colors.link
        ctx.fillStyle = colors.link
        ctx.globalAlpha = 0.55 * a
        ctx.lineWidth = 1
        ctx.setLineDash([2, 5])
        ctx.beginPath()
        ctx.moveTo(0, ptr.y + 0.5)
        ctx.lineTo(w, ptr.y + 0.5)
        ctx.moveTo(ptr.x + 0.5, top - 4)
        ctx.lineTo(ptr.x + 0.5, h)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.arc(ptr.x, ptr.y, 9 + (1 - a) * 8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(ptr.x, ptr.y, 1.6, 0, Math.PI * 2)
        ctx.fill()

        const col = COLS[Math.min(COLS.length - 1, Math.max(0, Math.floor((ptr.x / w) * COLS.length)))]
        const row = Math.min(6, Math.max(1, Math.floor(((ptr.y - top) / (h - top)) * 6) + 1))
        const label = `${col}${row} · ${String(Math.round(ptr.x)).padStart(4, '0')},${String(Math.round(ptr.y)).padStart(4, '0')}`
        ctx.font = '600 11px ui-monospace, Menlo, monospace'
        ctx.textAlign = 'left'
        const tw = ctx.measureText(label).width + 12
        const lx = Math.min(w - tw - 4, ptr.x + 14)
        const ly = Math.max(top + 2, ptr.y - 26)
        ctx.globalAlpha = 0.95 * a
        ctx.fillStyle = colors.link
        ctx.fillRect(lx, ly, tw, 18)
        ctx.fillStyle = '#121212'
        ctx.fillText(label, lx + 6, ly + 9.5)
        ctx.globalAlpha = 1
      }
    }

    const loop = (t: number) => {
      energy += ((ptr.inside ? 1 : 0) - energy) * 0.16
      draw(t)
      if (ptr.inside || energy > 0.012) raf = requestAnimationFrame(loop)
      else {
        energy = 0
        raf = 0
        draw(t)
      }
    }
    const wake = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop)
    }

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      ptr.inside = true
      wake()
    }
    const leave = () => {
      ptr.inside = false
      wake()
    }

    readColors()
    build()
    draw(0)

    if (!reduced) {
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerdown', move)
      el.addEventListener('pointerleave', leave)
      el.addEventListener('pointercancel', leave)
    }
    const ro = new ResizeObserver(() => {
      build()
      draw(performance.now())
    })
    ro.observe(el)
    const mo = new MutationObserver(() => {
      readColors()
      draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', move)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointercancel', leave)
    }
  }, [text])

  return (
    <div ref={wrap} className="relative w-full cursor-crosshair select-none" style={{ touchAction: 'pan-y' }}>
      <canvas ref={canvas} aria-hidden="true" className="block" />
      <span className="sr-only">{text}</span>
    </div>
  )
}
