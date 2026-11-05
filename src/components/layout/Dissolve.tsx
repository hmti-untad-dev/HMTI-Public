import type { CSSProperties, ReactNode } from 'react'

/**
 * Sapuan dither per sel untuk navbar (diadaptasi dari pola "dither sweep"): kisi sel persegi sama rata yang
 * menyala satu per satu dengan urutan terhambur, dari kiri ke kanan. Tiap sel punya satu dari 4 tingkat
 * gelap-terang dari SATU warna hover (token --brand), jadi hasilnya mosaik gradasi satu warna.
 * Tanpa canvas, rAF, atau pustaka animasi: hanya transisi opacity bertunda per sel (CSS di globals.css).
 * Urutan dan tingkat warna dihitung dari hash, bukan Math.random, supaya server dan klien sama (hydration aman).
 */
const CELL = 11 // px; ukuran sel yang dituju, sama di semua elemen
const SHADES = [0.34, 0.5, 0.7, 1]

const frac = (n: number) => n - Math.floor(n)

function build(cols: number, rows: number) {
  const out: { t: number; o: number }[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jitter = frac(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453)
      const shade = frac(Math.sin(col * 39.346 + row * 11.135) * 24634.6345)
      // 55% urutan kiri-ke-kanan, 45% acak: tepi sapuan terhambur, bukan garis lurus.
      out.push({ t: Number(((col / Math.max(1, cols - 1)) * 0.55 + jitter * 0.45).toFixed(3)), o: SHADES[Math.floor(shade * SHADES.length)] })
    }
  }
  return out
}

const cache = new Map<string, ReturnType<typeof build>>()

/** w dan h = perkiraan ukuran elemen dalam px, hanya untuk menentukan jumlah sel agar tiap sel mendekati persegi. */
export function Dissolve({ w, h = 64 }: { w: number; h?: number }) {
  const cols = Math.max(3, Math.round(w / CELL))
  const rows = Math.max(2, Math.round(h / CELL))
  const key = `${cols}x${rows}`
  let cells = cache.get(key)
  if (!cells) {
    cells = build(cols, rows)
    cache.set(key, cells)
  }
  return (
    <span className="dither-px" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {cells.map((c, i) => (
        <i key={i} style={{ '--t': c.t, '--o': c.o } as CSSProperties} />
      ))}
    </span>
  )
}

/** Label tercetak dua kali: pasangannya menggulir naik bersama saat hover. Salinan kedua disembunyikan dari pembaca layar. */
export function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  )
}

/** Dua tanda siku di pojok kanan sel menu berisi submenu; bergeser saat submenu terbuka. */
export function Ticks() {
  const tick = (cls: string) => (
    <span className={`nav-tick ${cls}`} aria-hidden="true">
      <svg viewBox="0 0 7 7" fill="none">
        <path d="M6 6.5V0.5H0" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    </span>
  )
  return (
    <>
      {tick('nav-tick-t')}
      {tick('nav-tick-b')}
    </>
  )
}

/** Perkiraan lebar sel menu teks mono kapital (px). */
export const cellWidth = (label: string, pad = 32) => Math.round(pad + label.length * 8.5)
