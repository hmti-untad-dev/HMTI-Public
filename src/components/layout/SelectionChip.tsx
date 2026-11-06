'use client'

import { useEffect, useRef, useState } from 'react'

type Chip = { x: number; y: number; n: number; below: boolean }

/**
 * Kotak kecil yang muncul di atas teks yang diseleksi (pasangan ::selection di globals.css): jumlah karakter dan
 * tombol Salin. Hanya untuk teks bacaan di <main>, tidak di kolom isian. Hilang saat seleksi dilepas atau digulir.
 */
export function SelectionChip() {
  const [chip, setChip] = useState<Chip | null>(null)
  const [copied, setCopied] = useState(false)
  const text = useRef('')

  useEffect(() => {
    let t = 0
    const read = () => {
      const sel = window.getSelection()
      const s = sel?.toString().trim() ?? ''
      if (!sel || sel.isCollapsed || s.length < 2 || !sel.rangeCount) return setChip(null)
      const node = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement
      if (!node?.closest('main') || node.closest('input, textarea, [contenteditable="true"], .sel-chip')) return setChip(null)
      const r = sel.getRangeAt(0).getBoundingClientRect()
      if (!r.width && !r.height) return setChip(null)
      text.current = s
      const below = r.top < 64
      setCopied(false)
      setChip({ x: Math.min(Math.max(r.left + r.width / 2, 80), window.innerWidth - 80), y: below ? r.bottom + 10 : r.top - 10, n: s.length, below })
    }
    const later = () => {
      clearTimeout(t)
      t = window.setTimeout(read, 120)
    }
    const hide = () => setChip(null)
    document.addEventListener('selectionchange', later)
    window.addEventListener('scroll', hide, { passive: true })
    window.addEventListener('resize', hide)
    return () => {
      clearTimeout(t)
      document.removeEventListener('selectionchange', later)
      window.removeEventListener('scroll', hide)
      window.removeEventListener('resize', hide)
    }
  }, [])

  if (!chip) return null
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.current)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div
      className="sel-chip"
      data-below={chip.below}
      style={{ left: chip.x, top: chip.y }}
      // Jangan sampai klik di kotak ini menghapus seleksi.
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="sel-chip-count" aria-hidden="true">
        {chip.n} kar
      </span>
      <button type="button" onClick={copy} className="sel-chip-btn">
        {copied ? 'Tersalin' : 'Salin'}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Teks tersalin ke papan klip' : ''}
      </span>
    </div>
  )
}
