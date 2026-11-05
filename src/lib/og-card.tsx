import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

/**
 * Kartu pratinjau tautan (Open Graph / Twitter) 1200x630. Meniru hero situs: jargon "We Make A Better Future"
 * dari piksel (kata kecil berpiksel kosong abu, kata utama terisi, kata terakhir biru), nomor baris ala editor,
 * dan chip "hmti.core" berkabel. Warna mengikuti tema gelap situs (tokens.css) agar menonjol di aplikasi chat.
 * Teks digambar tanpa berkas font (piksel = div), jadi tidak bergantung pada font apa pun.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_ALT = 'HMTI UNTAD, Kabinet All Blue 2026: We Make A Better Future'

const C = {
  bg: '#121212',
  panel: '#181a20',
  line: '#2e2e2e',
  ink: '#eceef7',
  muted: '#8b8f9c',
  dim: '#4a4e5a',
  link: '#b4d6fe',
  brand: '#5253ad',
}

// Glyph 5x7 untuk huruf yang dipakai jargon.
const G: Record<string, string[]> = {
  W: ['1...1', '1...1', '1...1', '1.1.1', '1.1.1', '11.11', '1...1'],
  M: ['1...1', '11.11', '1.1.1', '1.1.1', '1...1', '1...1', '1...1'],
  A: ['.111.', '1...1', '1...1', '11111', '1...1', '1...1', '1...1'],
  B: ['1111.', '1...1', '1...1', '1111.', '1...1', '1...1', '1111.'],
  F: ['11111', '1....', '1....', '1111.', '1....', '1....', '1....'],
  e: ['.....', '.....', '.111.', '1...1', '11111', '1....', '.111.'],
  a: ['.....', '.....', '.111.', '....1', '.1111', '1...1', '.1111'],
  k: ['1....', '1....', '1..1.', '1.1..', '11...', '1.1..', '1..1.'],
  t: ['.1...', '.1...', '1111.', '.1...', '.1...', '.1..1', '..11.'],
  r: ['.....', '.....', '1.11.', '11..1', '1....', '1....', '1....'],
  u: ['.....', '.....', '1...1', '1...1', '1...1', '1..11', '.11.1'],
}

type Tone = 'dim' | 'ink' | 'link'
const LINES: { text: string; tone: Tone }[][] = [
  [
    { text: 'We', tone: 'dim' },
    { text: 'Make', tone: 'ink' },
  ],
  [
    { text: 'A', tone: 'dim' },
    { text: 'Better', tone: 'ink' },
  ],
  [{ text: 'Future', tone: 'link' }],
]

const CELL = 13
const ROW_H = 7 * CELL
const ROW_GAP = 30

function PixelLine({ words }: { words: { text: string; tone: Tone }[] }) {
  const cells: { x: number; y: number; tone: Tone }[] = []
  let col = 0
  words.forEach((w, wi) => {
    if (wi > 0) col += 3
    for (const ch of w.text) {
      const g = G[ch]
      g.forEach((row, y) => [...row].forEach((v, x) => v === '1' && cells.push({ x: col + x, y, tone: w.tone })))
      col += 6
    }
  })
  const width = (col - 1) * CELL
  return (
    <div style={{ display: 'flex', position: 'relative', width, height: ROW_H }}>
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.x * CELL,
            top: c.y * CELL,
            width: CELL - 2,
            height: CELL - 2,
            background: c.tone === 'dim' ? 'transparent' : c.tone === 'ink' ? C.ink : C.link,
            border: c.tone === 'dim' ? `2px solid ${C.dim}` : 'none',
          }}
        />
      ))}
      {/* Kursor ketik setelah kata terakhir. */}
      {words[words.length - 1].tone === 'link' && (
        <div style={{ position: 'absolute', left: width + CELL * 1.5, top: 0, width: CELL * 2, height: ROW_H, background: C.brand }} />
      )}
    </div>
  )
}

function Chip({ logo }: { logo: string }) {
  const S = 236
  const pins = [0.2, 0.35, 0.5, 0.65, 0.8]
  return (
    <div style={{ display: 'flex', position: 'relative', width: S + 60, height: S + 60, alignItems: 'center', justifyContent: 'center' }}>
      {/* Kaki chip di keempat sisi. */}
      {pins.map((p) => (
        <div key={`t${p}`} style={{ position: 'absolute', left: 30 + S * p - 4, top: 6, width: 8, height: 24, background: C.line }} />
      ))}
      {pins.map((p) => (
        <div key={`b${p}`} style={{ position: 'absolute', left: 30 + S * p - 4, bottom: 6, width: 8, height: 24, background: C.line }} />
      ))}
      {pins.map((p) => (
        <div key={`l${p}`} style={{ position: 'absolute', top: 30 + S * p - 4, left: 6, width: 24, height: 8, background: p === 0.5 ? C.link : C.line }} />
      ))}
      {pins.map((p) => (
        <div key={`r${p}`} style={{ position: 'absolute', top: 30 + S * p - 4, right: 6, width: 24, height: 8, background: C.line }} />
      ))}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: S,
          height: S,
          background: C.panel,
          border: `2px solid ${C.line}`,
          position: 'relative',
        }}
      >
        {/* Penanda pin 1 di sudut kiri atas, seperti chip sungguhan. */}
        <div style={{ position: 'absolute', left: 12, top: 12, width: 10, height: 10, background: C.link }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={136} height={136} alt="" style={{ borderRadius: 999 }} />
        <div style={{ marginTop: 16, fontSize: 18, letterSpacing: 4, color: C.muted, textTransform: 'uppercase' }}>hmti.core</div>
      </div>
    </div>
  )
}

export async function renderOgCard() {
  const png = await readFile(join(process.cwd(), 'src/assets/og-logo.png'))
  const logo = `data:image/png;base64,${png.toString('base64')}`

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: C.bg, color: C.ink, padding: '52px 64px 44px', position: 'relative' }}>
        {/* Garis aksen tipis di tepi atas. */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 6, background: C.brand }} />

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, letterSpacing: 3, color: C.muted, textTransform: 'uppercase' }}>
          <span style={{ color: C.link }}>HMTI UNTAD</span>
          <span style={{ margin: '0 14px', color: C.dim }}>/</span>
          <span>Kabinet All Blue</span>
          <span style={{ margin: '0 14px', color: C.dim }}>/</span>
          <span>Periode 2026</span>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>
            {LINES.map((words, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', width: 58, fontSize: 20, color: C.dim }}>{String(i + 1).padStart(2, '0')}</div>
                <PixelLine words={words} />
              </div>
            ))}
          </div>
          <Chip logo={logo} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `2px solid ${C.line}`, paddingTop: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, color: C.ink }}>Himpunan Mahasiswa Teknik Informatika</div>
            <div style={{ fontSize: 22, color: C.muted, marginTop: 4 }}>Universitas Tadulako, Palu</div>
          </div>
          <div style={{ display: 'flex', fontSize: 18, letterSpacing: 2, color: C.muted }}>
            <span style={{ color: C.link }}>[ OK ]</span>
            <span style={{ marginLeft: 10 }}>hmti-os 2026 · siap</span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
