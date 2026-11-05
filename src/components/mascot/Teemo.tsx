'use client'

import { useEffect, useRef, useState } from 'react'

import { CatSit } from './Cat'
import { Duck } from './Duck'

const LINES = ['Meong!', 'Hah?! Kaget…', 'Teemo di sini.', 'Elus lagi dong.', 'Jangan lupa istirahat.', 'Sudah minum air?']
const DUCK_LINES = [
  'Kwek! Coba jelaskan kodemu ke aku.',
  'Kwek. Sudah cek console.log?',
  'Kwek! Titik koma ketinggalan?',
  'Kwek… restart dulu, siapa tahu.',
  'Kwek! Commit dulu sebelum ubah besar.',
]
const PET_DISTANCE = 260 // px gerakan kursor di atas Teemo sampai ia merasa dielus

type Heart = { id: number; x: number }

/**
 * Teemo di footer, ditemani bebek karet.
 * - Mata Teemo mengikuti kursor di mana pun di halaman (hanya saat footer terlihat).
 * - Elus: gerakkan kursor bolak-balik di atasnya; ia memejam senang (^ ^) dan hati beterbangan.
 * - Klik/Enter: melompat, bulu meruncing, dan mengeong.
 * - Bebek: diklik mencicit dan memberi tips debugging; Teemo menoleh ke bebek.
 * Semua bisa difokus dan dioperasikan dengan keyboard; gerak dimatikan bila pengguna memilih gerak dikurangi.
 */
export function Teemo({ className = '' }: { className?: string }) {
  const [line, setLine] = useState<string | null>(null)
  const [hop, setHop] = useState(false)
  const [startled, setStartled] = useState(false)
  const [happy, setHappy] = useState(false)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [squeak, setSqueak] = useState(false)
  const count = useRef(0)
  const duckCount = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const happyTimer = useRef<number | undefined>(undefined)
  const pet = useRef({ dist: 0, x: 0, y: 0 })
  const heartId = useRef(0)
  const art = useRef<HTMLSpanElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const lookAtDuck = useRef(0)

  const say = (text: string, ms = 1800) => {
    setLine(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setLine(null)
      setStartled(false)
    }, ms)
  }

  // Mata mengikuti kursor di seluruh halaman, hanya selama Teemo terlihat.
  useEffect(() => {
    const el = art.current
    const box = root.current
    if (!el || !box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = false
    let raf = 0
    let px = 0
    let py = 0
    const apply = () => {
      raf = 0
      if (Date.now() < lookAtDuck.current) return
      const r = el.getBoundingClientRect()
      const dx = (px - (r.left + r.width / 2)) / Math.max(200, window.innerWidth / 3)
      const dy = (py - (r.top + r.height * 0.35)) / Math.max(200, window.innerHeight / 3)
      el.style.setProperty('--px', String(Math.max(-1.8, Math.min(1.8, dx * 2.2))))
      el.style.setProperty('--py', String(Math.max(-1.4, Math.min(1.4, dy * 2.2))))
    }
    const onMove = (e: PointerEvent) => {
      if (!visible) return
      px = e.clientX
      py = e.clientY
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting))
    io.observe(box)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  function poke() {
    count.current += 1
    say(LINES[count.current % LINES.length], 1600)
    setHop(false)
    requestAnimationFrame(() => setHop(true))
    setStartled(true)
    setHappy(false)
  }

  function petMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const p = pet.current
    if (p.x || p.y) p.dist += Math.hypot(e.clientX - p.x, e.clientY - p.y)
    p.x = e.clientX
    p.y = e.clientY
    if (p.dist > PET_DISTANCE) {
      p.dist = 0
      setHappy(true)
      say('Purrr…', 1400)
      const id = ++heartId.current
      setHearts((h) => [...h.slice(-5), { id, x: 20 + Math.round(Math.random() * 60) }])
      window.clearTimeout(happyTimer.current)
      happyTimer.current = window.setTimeout(() => setHappy(false), 1600)
    }
  }

  function quack() {
    duckCount.current += 1
    setSqueak(false)
    requestAnimationFrame(() => setSqueak(true))
    say(DUCK_LINES[duckCount.current % DUCK_LINES.length], 2400)
    // Teemo menoleh ke bebek (di kanannya) sebentar.
    lookAtDuck.current = Date.now() + 1500
    art.current?.style.setProperty('--px', '1.8')
    art.current?.style.setProperty('--py', '0.6')
    setStartled(true)
  }

  return (
    <div ref={root} className={`teemo ${className}`}>
      {line && (
        <p role="status" className="absolute bottom-[88%] left-[40%] z-10 w-max max-w-56 border border-line bg-surface-raised px-3 py-1.5 text-xs text-ink shadow-md">
          {line}
        </p>
      )}
      <div className="flex items-end gap-1">
        <button
          type="button"
          onClick={poke}
          onPointerMove={petMove}
          onPointerLeave={() => (pet.current = { dist: 0, x: 0, y: 0 })}
          aria-label="Teemo, maskot HMTI. Tekan untuk menyapa, elus dengan menggerakkan kursor di atasnya"
          className="relative block w-16 cursor-pointer sm:w-[4.5rem]"
        >
          {hearts.map((h) => (
            <span
              key={h.id}
              aria-hidden="true"
              className="teemo-heart"
              style={{ left: `${h.x}%` }}
              onAnimationEnd={() => setHearts((all) => all.filter((x) => x.id !== h.id))}
            >
              ♥
            </span>
          ))}
          <span ref={art} className={`block ${hop ? 'cat-hop' : ''}`} onAnimationEnd={() => setHop(false)}>
            <CatSit className="block w-full" fluff={startled} wide={startled} happy={happy} />
          </span>
        </button>
        <button
          type="button"
          onClick={quack}
          aria-label="Bebek karet, teman Teemo. Tekan untuk tips debugging"
          className="mb-0.5 block w-8 cursor-pointer sm:w-9"
        >
          <span className={`block ${squeak ? 'duck-squeak' : ''}`} onAnimationEnd={() => setSqueak(false)}>
            <Duck className="block w-full" />
          </span>
        </button>
      </div>
    </div>
  )
}
