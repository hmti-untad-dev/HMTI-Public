'use client'

import { useEffect, useRef } from 'react'

import { afterBoot } from '@/lib/boot'

/** dim = abu, piksel berongga; ink = warna teks, piksel penuh; link = biru HMTI, penuh dan sesekali glitch. */
export type Tone = 'dim' | 'ink' | 'link'
export type MottoLine = { words: { text: string; tone: Tone }[] }

type Particle = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; tone: 0 | 1 | 2; heat: number; j: number; waved: boolean }

const TONES: Tone[] = ['dim', 'ink', 'link']
const frac = (n: number) => n - Math.floor(n)

/**
 * Jargon raksasa bergaya editor kode: nomor baris di kiri, kata berwarna seperti sorotan sintaks, dan kursor
 * berkedip di akhir. Hurufnya tersusun dari ribuan piksel persegi (kanvas) yang menempati posisi huruf DOM persis.
 * - Kursor/jari mendorong piksel, piksel kembali dengan pegas dan menyala biru; klik/ketuk meledakkannya.
 * - Saat masuk, gelombang piksel menyapu dari kiri; sesekali garis pindai lewat atau kata biru ber-glitch.
 * Teks asli (h1) tetap ada untuk pembaca layar dan tanpa JS / gerak dikurangi. rAF hanya jalan saat ada gerak.
 */
export function PixelMotto({ lines, className = '' }: { lines: MottoLine[]; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    const area = el?.querySelector<HTMLElement>('.motto-text')
    if (!el || !cv || !area) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    let parts: Particle[] = []
    let cell = 6
    let w = 0
    let h = 0
    let raf = 0
    let idle = 0
    let resizeT = 0
    let visible = true
    let introAt = 0
    let scan = -1
    let lastFx = performance.now()
    let glitch = { until: 0, bands: [] as { y0: number; y1: number; dx: number }[] }
    let colors: [string, string, string] = ['#888', '#121212', '#3e4094']
    let bg = '#121212'
    const pointer = { x: -9999, y: -9999, on: false }

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      colors = [cs.getPropertyValue('--ink-muted').trim() || '#888', cs.getPropertyValue('--ink').trim() || '#121212', cs.getPropertyValue('--link').trim() || '#3e4094']
      bg = cs.getPropertyValue('--bg').trim() || '#121212'
    }

    const build = () => {
      const r = area.getBoundingClientRect()
      w = Math.round(r.width)
      h = Math.round(r.height)
      if (w < 10 || h < 10) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = w * dpr
      cv.height = h * dpr
      cv.style.width = `${w}px`
      cv.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = w < 420 ? 4 : w < 800 ? 5 : 6

      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const o = off.getContext('2d', { willReadFrequently: true })!
      const code = ['#00ff00', '#ff0000', '#0000ff'] // dim, ink, link: dibedakan lewat kanal warna
      area.querySelectorAll<HTMLElement>('[data-word]').forEach((span) => {
        const s = span.getBoundingClientRect()
        const cs = getComputedStyle(span)
        o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const m = o.measureText(span.textContent || '')
        o.fillStyle = code[Math.max(0, TONES.indexOf((span.dataset.tone as Tone) || 'ink'))]
        o.fillText(span.textContent || '', s.left - r.left, s.top - r.top + (m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.9))
      })
      const data = o.getImageData(0, 0, w, h).data
      const next: Particle[] = []
      for (let y = Math.floor(cell / 2); y < h; y += cell) {
        for (let x = Math.floor(cell / 2); x < w; x += cell) {
          const i = (y * w + x) * 4
          if (data[i + 3] < 120) continue
          const [rr, gg, bb] = [data[i], data[i + 1], data[i + 2]]
          const tone = (gg >= rr && gg >= bb ? 0 : bb > rr ? 2 : 1) as 0 | 1 | 2
          next.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, tone, heat: 0, j: frac(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453), waved: false })
        }
      }
      parts = next
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h)
      const size = cell - 1
      const glitching = now < glitch.until
      for (const p of parts) {
        let x = p.x
        if (glitching && p.tone === 2) {
          for (const b of glitch.bands) if (p.hy >= b.y0 && p.hy < b.y1) x += b.dx
        }
        if (p.heat >= 0.35) {
          ctx.globalAlpha = 0.55 + Math.min(0.45, p.heat * 0.45)
          ctx.fillStyle = colors[2]
          ctx.fillRect(x - size / 2, p.y - size / 2, size, size)
          ctx.globalAlpha = 1
        } else if (p.tone === 0) {
          // Piksel berongga untuk kata pendamping (We, A): tekstur berbeda dari kata utama.
          ctx.strokeStyle = colors[0]
          ctx.lineWidth = 1
          ctx.strokeRect(x - size / 2 + 0.5, p.y - size / 2 + 0.5, size - 1, size - 1)
        } else {
          ctx.fillStyle = colors[p.tone]
          ctx.fillRect(x - size / 2, p.y - size / 2, size, size)
        }
      }
      if (scan >= 0) {
        ctx.fillStyle = colors[2]
        ctx.globalAlpha = 0.45
        ctx.fillRect(scan, 0, 2, h)
        ctx.globalAlpha = 1
      }
      if (pointer.on) drawReticle()
    }

    // Sasaran kursor bergaya footer (AsciiWordmark): garis silang putus-putus, cincin, dan label sel + koordinat.
    const COLS = ['A', 'B', 'C', 'D', 'E', 'F']
    const drawReticle = () => {
      const { x, y } = pointer
      ctx.strokeStyle = colors[2]
      ctx.fillStyle = colors[2]
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.55
      ctx.setLineDash([2, 5])
      ctx.beginPath()
      ctx.moveTo(0, Math.round(y) + 0.5)
      ctx.lineTo(w, Math.round(y) + 0.5)
      ctx.moveTo(Math.round(x) + 0.5, 0)
      ctx.lineTo(Math.round(x) + 0.5, h)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, 1.8, 0, Math.PI * 2)
      ctx.fill()
      const col = COLS[Math.min(COLS.length - 1, Math.max(0, Math.floor((x / w) * COLS.length)))]
      const row = Math.min(lines.length, Math.max(1, Math.floor((y / h) * lines.length) + 1))
      const label = `${col}${row} · ${String(Math.round(x)).padStart(4, '0')},${String(Math.round(y)).padStart(4, '0')}`
      ctx.font = '600 11px ui-monospace, Menlo, monospace'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      const tw = ctx.measureText(label).width + 12
      const lx = Math.min(w - tw - 2, x + 14)
      const ly = Math.max(2, y - 28)
      ctx.globalAlpha = 0.95
      ctx.fillRect(lx, ly, tw, 18)
      ctx.fillStyle = bg
      ctx.fillText(label, lx + 6, ly + 9.5)
      ctx.globalAlpha = 1
    }

    const R = () => (w < 420 ? 60 : 110)
    const step = (now: number) => {
      let energy = 0
      const rad = R()
      const rad2 = rad * rad
      // Efek berkala (tiap ~6 detik, bergantian acak): garis pindai atau glitch pada kata biru.
      if (scan < 0 && now > glitch.until && now - lastFx > 6000 && !pointer.on && !introAt) {
        lastFx = now
        if (Math.random() < 0.5) scan = 0
        else {
          const bands = Array.from({ length: 3 }, () => {
            const y0 = Math.random() * h
            return { y0, y1: y0 + cell * (2 + Math.floor(Math.random() * 4)), dx: (Math.random() - 0.5) * 22 }
          })
          glitch = { until: now + 260, bands }
        }
      }
      if (scan >= 0) {
        scan += w / 70
        if (scan > w) scan = -1
      }
      const front = introAt ? ((now - introAt) / 650) * w : -1
      if (introAt && front > w + cell) introAt = 0
      for (const p of parts) {
        if (front >= 0 && !p.waved && p.hx <= front) {
          p.waved = true
          p.vx += (p.j - 0.5) * 9
          p.vy -= 3 + p.j * 6
          p.heat = 1
        }
        if (pointer.on) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < rad2) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / rad) * 3.2
            p.vx += (dx / d) * f
            p.vy += (dy / d) * f
            p.heat = 1
          }
        }
        if (scan >= 0 && Math.abs(p.x - scan) < cell * 2) {
          p.vy -= 0.6
          p.heat = Math.max(p.heat, 0.6)
        }
        p.vx += (p.hx - p.x) * 0.06
        p.vy += (p.hy - p.y) * 0.06
        p.vx *= 0.82
        p.vy *= 0.82
        p.x += p.vx
        p.y += p.vy
        p.heat *= 0.94
        energy += Math.abs(p.vx) + Math.abs(p.vy) + p.heat
      }
      draw(now)
      const busy = pointer.on || scan >= 0 || introAt > 0 || now < glitch.until || energy > parts.length * 0.02
      raf = busy && visible ? requestAnimationFrame(step) : 0
      if (!busy) {
        window.clearTimeout(idle)
        idle = window.setTimeout(kick, 6200)
      }
    }
    function kick() {
      if (!raf && visible && parts.length) raf = requestAnimationFrame(step)
    }

    const local = (e: PointerEvent) => {
      const r = area.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: PointerEvent) => {
      const p = local(e)
      pointer.x = p.x
      pointer.y = p.y
      pointer.on = true
      kick()
    }
    const onLeave = () => {
      pointer.on = false
      pointer.x = pointer.y = -9999
      kick()
      draw(performance.now()) // hapus sasaran segera
    }
    const onDown = (e: PointerEvent) => {
      const c = local(e)
      for (const p of parts) {
        const dx = p.x - c.x
        const dy = p.y - c.y
        const d = Math.hypot(dx, dy) || 1
        if (d < 220) {
          const f = (1 - d / 220) * 26
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
          p.heat = 1
        }
      }
      kick()
    }

    readColors()
    build()
    el.dataset.live = 'true'
    draw(performance.now())
    const cancelBoot = afterBoot(() =>
      window.setTimeout(() => {
        introAt = performance.now()
        kick()
      }, 150),
    )

    area.addEventListener('pointermove', onMove)
    area.addEventListener('pointerdown', onDown)
    area.addEventListener('pointerleave', onLeave)
    area.addEventListener('pointercancel', onLeave)
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeT)
      resizeT = window.setTimeout(() => {
        build()
        draw(performance.now())
      }, 120)
    })
    ro.observe(area)
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      if (visible) kick()
    })
    io.observe(el)
    const mo = new MutationObserver(() => {
      readColors()
      draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelBoot()
      cancelAnimationFrame(raf)
      window.clearTimeout(idle)
      window.clearTimeout(resizeT)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerdown', onDown)
      area.removeEventListener('pointerleave', onLeave)
      area.removeEventListener('pointercancel', onLeave)
      delete el.dataset.live
    }
  }, [lines])

  return (
    <div ref={wrap} className={`pixel-motto ${className}`}>
      <ol className="motto-gutter" aria-hidden="true">
        {lines.map((_, i) => (
          <li key={i}>{String(i + 1).padStart(2, '0')}</li>
        ))}
      </ol>
      <div className="motto-text">
        <h1 className="pixel-motto-text">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line.words.map((word, j) => (
                <span key={j}>
                  {j > 0 && ' '}
                  <span data-word data-tone={word.tone} className={`tone-${word.tone}`}>
                    {word.text}
                  </span>
                </span>
              ))}
              {i === lines.length - 1 && <span className="motto-cursor" aria-hidden="true" />}
            </span>
          ))}
        </h1>
        <canvas ref={canvas} aria-hidden="true" className="pixel-motto-canvas" />
      </div>
    </div>
  )
}
