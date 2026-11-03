'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** URL foto. Kosong: potret dibuat dari inisial nama (siluet ASCII) sampai foto asli diunggah. */
  src: string | null
  name: string
  /** Label gaya computer vision di pojok, mis. "ID_03". */
  tag?: string
  /** Ganti nilainya untuk memutar ulang efek "resolve" (mis. saat orang yang ditampilkan berganti). */
  replayKey?: string | number
  /** Paksa mode ASCII (tombol di luar komponen, untuk layar sentuh/keyboard). */
  pinned?: boolean
  className?: string
}

const RAMP = ' .:-=+*#%@'
const BLOCKS = [56, 36, 22, 13, 8, 4, 2, 1] // ukuran piksel "resolve": kasar menuju tajam
const STEP_MS = 55
const SCAN_MS = 520

type Source = { canvas: HTMLCanvasElement; ascii: HTMLCanvasElement | null }

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Gambar sumber (foto ber-crop "cover", atau inisial) dan versi ASCII-nya. */
async function buildSource(src: string | null, name: string, w: number, h: number, scale: number): Promise<Source> {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  let drawn = false
  if (src) {
    try {
      const img = await loadImage(src)
      const r = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const dw = img.naturalWidth * r
      const dh = img.naturalHeight * r
      ctx.drawImage(img, (w - dw) / 2, (h - dh) * 0.3, dw, dh) // sedikit ke atas agar wajah tidak terpotong
      drawn = true
    } catch {
      /* foto gagal dimuat: jatuh ke potret inisial */
    }
  }
  if (!drawn) {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#2a2b57')
    g.addColorStop(1, '#121212')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#b4d6fe'
    ctx.font = `700 ${Math.round(h * 0.42)}px ui-monospace, Menlo, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initialsOf(name), w / 2, h * 0.46)
  }

  // ASCII: contoh kecerahan per sel lalu gambar karakter. getImageData gagal bila gambar lintas-origin (canvas tercemar).
  let ascii: HTMLCanvasElement | null = null
  try {
    const cw = 7 * scale
    const ch = 11 * scale
    const cols = Math.max(8, Math.floor(w / cw))
    const rows = Math.max(8, Math.floor(h / ch))
    const small = document.createElement('canvas')
    small.width = cols
    small.height = rows
    const sctx = small.getContext('2d', { willReadFrequently: true })!
    sctx.drawImage(canvas, 0, 0, cols, rows)
    const data = sctx.getImageData(0, 0, cols, rows).data

    ascii = document.createElement('canvas')
    ascii.width = w
    ascii.height = h
    const actx = ascii.getContext('2d')!
    actx.fillStyle = '#0b0b12'
    actx.fillRect(0, 0, w, h)
    actx.font = `${Math.round(ch * 0.92)}px ui-monospace, Menlo, monospace`
    actx.textBaseline = 'top'
    const ox = (w - cols * cw) / 2
    const oy = (h - rows * ch) / 2
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4
        const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        const c = RAMP[Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length))]
        if (c === ' ') continue
        actx.fillStyle = `rgba(180, 214, 254, ${0.35 + 0.65 * lum})`
        actx.fillText(c, ox + x * cw, oy + y * ch)
      }
    }
  } catch {
    ascii = null
  }
  return { canvas, ascii }
}

/**
 * Potret bergaya computer vision / bitmap: saat muncul, gambar "resolve" dari blok piksel kasar menjadi tajam;
 * saat kursor/fokus berada di atasnya, pemindai menyapu dan mengubahnya menjadi ASCII. Semua digambar di canvas
 * (aria-hidden); nama tetap tersedia lewat atribut `aria-label` pada pembungkus. Gerak dikurangi: langsung tajam.
 */
export function PixelPortrait({ src, name, tag, replayKey, pinned = false, className = '' }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const source = useRef<Source | null>(null)
  const state = useRef({ block: 1, p: 0, target: 0, raf: 0, resolveStart: 0 })
  const [visible, setVisible] = useState(false)
  const [hover, setHover] = useState(false)
  const [mode, setMode] = useState<'bitmap' | 'ascii'>('bitmap')
  const want = hover || pinned

  const draw = () => {
    const c = canvasRef.current
    const s = source.current
    if (!c || !s) return
    const ctx = c.getContext('2d')!
    const { w, h } = { w: c.width, h: c.height }
    const { block, p } = state.current
    ctx.imageSmoothingEnabled = false
    if (block > 1) {
      const tmp = document.createElement('canvas')
      tmp.width = Math.max(1, Math.round(w / block))
      tmp.height = Math.max(1, Math.round(h / block))
      const t = tmp.getContext('2d')!
      t.imageSmoothingEnabled = true
      t.drawImage(s.canvas, 0, 0, tmp.width, tmp.height)
      ctx.drawImage(tmp, 0, 0, w, h)
    } else {
      ctx.drawImage(s.canvas, 0, 0)
    }
    if (p > 0 && s.ascii) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, w, h * p)
      ctx.clip()
      ctx.drawImage(s.ascii, 0, 0)
      ctx.restore()
      if (p < 1) {
        ctx.fillStyle = 'rgba(180, 214, 254, 0.9)'
        ctx.fillRect(0, Math.round(h * p) - 1, w, 2)
        ctx.fillStyle = 'rgba(180, 214, 254, 0.18)'
        ctx.fillRect(0, Math.round(h * p) - 14, w, 13)
      }
    }
  }

  const loop = (now: number) => {
    const st = state.current
    let busy = false
    if (st.resolveStart) {
      const i = Math.floor((now - st.resolveStart) / STEP_MS)
      st.block = i >= BLOCKS.length ? 1 : BLOCKS[i]
      if (i < BLOCKS.length) busy = true
      else st.resolveStart = 0
    }
    if (st.p !== st.target) {
      const dir = st.target > st.p ? 1 : -1
      st.p = Math.min(1, Math.max(0, st.p + (dir * 16.7) / SCAN_MS))
      if (Math.abs(st.target - st.p) < 0.001) st.p = st.target
      busy = busy || st.p !== st.target
    }
    draw()
    st.raf = busy ? requestAnimationFrame(loop) : 0
  }
  const kick = () => {
    if (!state.current.raf) state.current.raf = requestAnimationFrame(loop)
  }

  // Muncul di layar -> mulai.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setVisible(true), io.disconnect()), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Bangun ulang sumber saat foto/nama/ukuran berubah; putar ulang "resolve" saat replayKey berubah.
  useEffect(() => {
    const el = root.current
    const c = canvasRef.current
    if (!el || !c || !visible) return
    let cancelled = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const build = async () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(32, Math.round(el.clientWidth * scale))
      const h = Math.max(32, Math.round(el.clientHeight * scale))
      c.width = w
      c.height = h
      const s = await buildSource(src, name, w, h, scale)
      if (cancelled) return
      source.current = s
      const st = state.current
      st.block = reduced ? 1 : BLOCKS[0]
      st.resolveStart = reduced ? 0 : performance.now()
      st.p = st.target
      draw()
      kick()
    }
    void build()
    let lastW = el.clientWidth
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - lastW) > 8) {
        lastW = el.clientWidth
        void build()
      }
    })
    ro.observe(el)
    return () => {
      cancelled = true
      ro.disconnect()
      cancelAnimationFrame(state.current.raf)
      state.current.raf = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, src, name, replayKey])

  // Arahkan pemindai sesuai hover/fokus/tombol.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    state.current.target = want ? 1 : 0
    if (reduced) state.current.p = state.current.target
    setMode(want ? 'ascii' : 'bitmap')
    draw()
    kick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want])

  const bracket = 'pointer-events-none absolute size-4 border-white/80'
  return (
    <div
      ref={root}
      role="img"
      aria-label={`Foto ${name}`}
      className={`absolute inset-0 overflow-hidden bg-scrim ${className}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="size-full" />
      {/* Lapisan "computer vision": siku bidik, bidik silang, label. Dekoratif. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className={`${bracket} left-2.5 top-2.5 border-l border-t`} />
        <span className={`${bracket} right-2.5 top-2.5 border-r border-t`} />
        <span className={`${bracket} bottom-2.5 left-2.5 border-b border-l`} />
        <span className={`${bracket} bottom-2.5 right-2.5 border-b border-r`} />
        <span className="absolute left-1/2 top-[38%] size-4 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-1/2 top-0 h-full w-px bg-white/50" />
          <span className="absolute left-0 top-1/2 h-px w-full bg-white/50" />
        </span>
        {tag && (
          <span className="absolute left-4 top-4 bg-scrim/75 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white">
            {tag} · {mode}
          </span>
        )}
      </div>
    </div>
  )
}
