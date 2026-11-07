import type { AllBlueLayer } from '@/content/kabinet'

/**
 * Lambang Kabinet All Blue, digambar dari maknanya (bukan dari berkas gambar):
 *  - Pusaran Ombak: empat lengan ombak berbentuk spiral logaritmik, satu untuk tiap arus samudra yang bertemu.
 *  - Pusaran Piksel: kotak-kotak di kisi tetap pada dua busur, plus garis glitch di ujungnya.
 *  - Inti Bintang: bintang empat sudut di pusat dengan cahaya yang memancar.
 * Geometri dihitung sekali saat modul dimuat dan deterministik (sama di server dan browser).
 * Gerak (putar, kedip, denyut) ada di globals.css bagian "Kabinet All Blue" dan mati bila gerak dikurangi.
 */

const f = (n: number) => Number(n.toFixed(2))

/** Pembangkit acak berbenih (mulberry32): pola piksel sama di setiap render. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- Pusaran Ombak ----------
const R_IN = 21
const R_OUT = 92
const SWEEP = Math.PI * 1.35
const K = Math.log(R_OUT / R_IN) / SWEEP
const ARMS = 4

const spiral = (theta: number, phase: number) => {
  const r = R_IN * Math.exp(K * theta)
  return [r * Math.cos(theta + phase), r * Math.sin(theta + phase)] as const
}

/** Satu lengan: pita meruncing di kedua ujung, tepi luarnya bergelombang seperti puncak ombak. */
function armPath(phase: number, wobbleSeed: number) {
  const N = 96
  const outer: string[] = []
  const inner: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const theta = t * SWEEP
    const [x, y] = spiral(theta, phase)
    const [x2, y2] = spiral(theta + 0.01, phase)
    const len = Math.hypot(x2 - x, y2 - y) || 1
    const nx = -(y2 - y) / len
    const ny = (x2 - x) / len
    const base = 10.5 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.85)
    const wave = 1 + 0.2 * Math.sin(t * Math.PI * 11 + wobbleSeed) + 0.08 * Math.sin(t * Math.PI * 29 + wobbleSeed * 2)
    outer.push(`${f(x + (nx * base * wave) / 2)} ${f(y + (ny * base * wave) / 2)}`)
    inner.push(`${f(x - (nx * base) / 2)} ${f(y - (ny * base) / 2)}`)
  }
  return `M ${outer.join(' L ')} L ${inner.reverse().join(' L ')} Z`
}

/** Percikan di ujung luar tiap lengan: lingkaran kecil yang mengecil mengikuti arah spiral. */
function spray(phase: number) {
  return [0.1, 0.19, 0.27, 0.34].map((d, i) => {
    const [x, y] = spiral(SWEEP + d, phase)
    return { x: f(x), y: f(y), r: f(2.3 - i * 0.45) }
  })
}

const ARM_SHAPES = Array.from({ length: ARMS }, (_, i) => {
  const phase = (i * Math.PI * 2) / ARMS
  return { d: armPath(phase, i * 1.7), spray: spray(phase) }
})

// ---------- Pusaran Piksel ----------
const GRID = 3.6
type Px = { x: number; y: number; s: number; d: number; t: number }
type Bar = { x: number; y: number; w: number }

const PIXELS = (() => {
  const rand = seeded(2026)
  const seen = new Set<string>()
  const out: Px[] = []
  // Dua busur berhadapan (atas-kiri dan bawah-kanan), mengikuti arah pusaran.
  for (const start of [-Math.PI * 0.95, Math.PI * 0.05]) {
    for (let k = 0; k < 120; k++) {
      const u = rand()
      const a = start + u * Math.PI * 0.9
      const dens = Math.sin(Math.PI * u)
      if (rand() > 0.25 + dens * 0.75) continue
      const r = 42 + rand() * 16 * (0.4 + dens)
      const gx = Math.round((r * Math.cos(a)) / GRID) * GRID
      const gy = Math.round((r * Math.sin(a)) / GRID) * GRID
      const id = `${gx},${gy}`
      if (seen.has(id)) continue
      seen.add(id)
      out.push({ x: f(gx), y: f(gy), s: rand() > 0.7 ? GRID * 0.55 : GRID * 0.85, d: f(rand() * 3), t: f(1.6 + rand() * 2.4) })
    }
  }
  return out
})()

/** Garis glitch di ujung busur: kiri-atas memanjang ke kiri, kanan-bawah memanjang ke kanan. */
const BARS: Bar[] = [
  { x: -76, y: -25, w: 14 },
  { x: -70, y: -17.8, w: 9 },
  { x: -80, y: -10.6, w: 18 },
  { x: 60, y: 8.4, w: 18 },
  { x: 64, y: 15.6, w: 10 },
  { x: 58, y: 22.8, w: 14 },
]

// ---------- Inti Bintang ----------
const STAR_R = 17
const STAR_IN = 2.6
const STAR = `M 0 ${-STAR_R} Q ${STAR_IN} ${-STAR_IN} ${STAR_R} 0 Q ${STAR_IN} ${STAR_IN} 0 ${STAR_R} Q ${-STAR_IN} ${STAR_IN} ${-STAR_R} 0 Q ${-STAR_IN} ${-STAR_IN} 0 ${-STAR_R} Z`
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4 + Math.PI / 8
  return { x1: f(Math.cos(a) * 22), y1: f(Math.sin(a) * 22), x2: f(Math.cos(a) * 30), y2: f(Math.sin(a) * 30) }
})

const layerClass = (layer: AllBlueLayer, active: AllBlueLayer | null) => `ab-layer${active && active !== layer ? ' is-dim' : ''}${active === layer ? ' is-on' : ''}`

export function AllBlueMark({ active = null, className = '', title = 'Lambang Kabinet All Blue' }: { active?: AllBlueLayer | null; className?: string; title?: string }) {
  return (
    <svg viewBox="-112 -112 224 224" className={`ab-mark ${className}`} role="img" aria-label={title}>
      <defs>
        <radialGradient id="ab-glow">
          <stop offset="0" stopColor="var(--ocean-glow)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--ocean-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className={layerClass('vortex', active)}>
        <g className="ab-vortex">
          {ARM_SHAPES.map((arm, i) => (
            <g key={i}>
              <path d={arm.d} fill="currentColor" />
              {arm.spray.map((s) => (
                <circle key={`${s.x}${s.y}`} cx={s.x} cy={s.y} r={s.r} fill="currentColor" />
              ))}
            </g>
          ))}
        </g>
      </g>

      <g className={layerClass('pixel', active)}>
        <g className="ab-pixels">
          {PIXELS.map((p) => (
            <rect
              key={`${p.x},${p.y}`}
              className="ab-px"
              x={f(p.x - p.s / 2)}
              y={f(p.y - p.s / 2)}
              width={f(p.s)}
              height={f(p.s)}
              style={{ '--d': `${p.d}s`, '--t': `${p.t}s` } as React.CSSProperties}
            />
          ))}
          {BARS.map((b) => (
            <rect key={`${b.x},${b.y}`} className="ab-bar" x={b.x} y={b.y} width={b.w} height={2.2} />
          ))}
        </g>
      </g>

      <g className={layerClass('core', active)}>
        <circle r={44} fill="url(#ab-glow)" className="ab-halo" />
        <g className="ab-rays">
          {RAYS.map((r) => (
            <line key={`${r.x1}${r.y1}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </g>
        <g transform="rotate(12)">
          <path d={STAR} className="ab-star" />
        </g>
      </g>
    </svg>
  )
}
