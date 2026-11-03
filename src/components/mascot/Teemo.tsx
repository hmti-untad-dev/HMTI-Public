'use client'

import { useRef, useState } from 'react'

import { CatSit } from './Cat'

const LINES = ['Meong!', 'Purr…', 'Teemo di sini.', 'Elus lagi dong.', 'Jangan lupa istirahat.', 'Ngantuk… tapi nggak jadi.']

/**
 * Teemo di footer: duduk santai (kedip + ekor bergoyang). Kursor di atasnya membuat pupil mengikuti dan ekor
 * bergoyang cepat; klik membuatnya melompat dan mengeong. Dapat difokus dan dioperasikan dengan keyboard.
 */
export function Teemo({ className = '' }: { className?: string }) {
  const [line, setLine] = useState<string | null>(null)
  const [hop, setHop] = useState(false)
  const count = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const art = useRef<HTMLSpanElement>(null)

  function look(e: React.PointerEvent<HTMLButtonElement>) {
    const el = art.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width
    const dy = (e.clientY - (r.top + r.height * 0.3)) / r.height
    el.style.setProperty('--px', String(Math.max(-1.6, Math.min(1.6, dx * 6))))
    el.style.setProperty('--py', String(Math.max(-1.2, Math.min(1.2, dy * 6))))
  }

  function poke() {
    count.current += 1
    setLine(LINES[count.current % LINES.length])
    setHop(false)
    requestAnimationFrame(() => setHop(true))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLine(null), 2200)
  }

  return (
    <div className={`teemo ${className}`}>
      {line && (
        <p role="status" className="absolute bottom-[88%] left-[62%] z-10 w-max max-w-44 border border-line bg-surface-raised px-3 py-1.5 text-xs text-ink shadow-md">
          {line}
        </p>
      )}
      <button
        type="button"
        onClick={poke}
        onPointerMove={look}
        onPointerLeave={() => {
          art.current?.style.setProperty('--px', '0')
          art.current?.style.setProperty('--py', '0')
        }}
        aria-label="Teemo, maskot HMTI. Tekan untuk menyapa"
        className="block w-16 cursor-pointer sm:w-[4.5rem]"
      >
        <span ref={art} className={`block ${hop ? 'cat-hop' : ''}`} onAnimationEnd={() => setHop(false)}>
          <CatSit className="block w-full" />
        </span>
      </button>
    </div>
  )
}
