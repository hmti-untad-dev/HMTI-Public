'use client'

import { useEffect, useId, useState } from 'react'

export type QuoteItem = { id: number; quote: string; name: string; role: string | null; photoUrl: string | null }

const INTERVAL = 9000

/**
 * Kutipan tokoh bergantian. Tab nama untuk memilih langsung (keyboard: panah kiri/kanan), berganti otomatis tiap
 * 9 detik dengan bilah waktu, berhenti saat ditunjuk/difokus atau bila pengguna memilih gerak dikurangi.
 */
export function QuoteRotator({ quotes }: { quotes: QuoteItem[] }) {
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  const [reduced, setReduced] = useState(false)
  const base = useId().replace(/:/g, '')
  const n = quotes.length

  useEffect(() => setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches), [])
  useEffect(() => {
    if (n < 2 || hold || reduced) return
    const t = window.setTimeout(() => setI((v) => (v + 1) % n), INTERVAL)
    return () => window.clearTimeout(t)
  }, [i, hold, reduced, n])

  if (n === 0) return null
  const q = quotes[i]
  const placeholder = q.quote.startsWith('(contoh)')

  return (
    <div
      className="quote-panel"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold(false)}
    >
      <div role="tablist" aria-label="Pilih kutipan" className="flex flex-wrap gap-1.5">
        {quotes.map((it, k) => (
          <button
            key={it.id}
            type="button"
            role="tab"
            id={`${base}-t${k}`}
            aria-selected={k === i}
            aria-controls={`${base}-p`}
            tabIndex={k === i ? 0 : -1}
            onClick={() => setI(k)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault()
                const next = (k + (e.key === 'ArrowRight' ? 1 : -1) + n) % n
                setI(next)
                document.getElementById(`${base}-t${next}`)?.focus()
              }
            }}
            className={`border px-3 py-1.5 text-left font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
              k === i ? 'border-brand bg-brand text-on-brand' : 'border-line text-ink-muted hover:border-brand hover:text-ink'
            }`}
          >
            {it.role ?? it.name}
          </button>
        ))}
      </div>

      <figure id={`${base}-p`} role="tabpanel" aria-labelledby={`${base}-t${i}`} className="quote-body relative mt-6 border-l-2 border-link pl-6">
        <span aria-hidden="true" className="quote-mark">“</span>
        <blockquote key={q.id} className="quote-text">
          <p className={placeholder ? 'text-ink-muted' : ''}>{q.quote}</p>
        </blockquote>
        <figcaption className="mt-5 flex items-center gap-3">
          {q.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={q.photoUrl} alt="" width={48} height={48} decoding="async" className="size-12 shrink-0 rounded-full border border-line object-cover" />
          ) : (
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border border-dashed border-line font-mono text-xs text-ink-muted">
              {q.name.startsWith('Nama') ? '?' : q.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('')}
            </span>
          )}
          <span>
            <span className="block font-display font-semibold">{q.name}</span>
            {q.role && <span className="block text-sm text-ink-muted">{q.role}</span>}
          </span>
        </figcaption>
        {n > 1 && !hold && !reduced && <span key={`t${i}`} className="quote-timer" aria-hidden="true" style={{ animationDuration: `${INTERVAL}ms` }} />}
      </figure>
    </div>
  )
}
