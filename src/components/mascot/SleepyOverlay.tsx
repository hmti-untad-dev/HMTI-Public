'use client'

import { useEffect, useRef, useState } from 'react'

import { CatSit, CatSleep, CatWalk, Cushion } from './Cat'

type Phase = 'off' | 'arrive' | 'sniff' | 'roam' | 'look' | 'back' | 'drowsy' | 'sleepy' | 'asleep' | 'wake' | 'greet' | 'leaving'

const IDLE_MS = 15_000
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel', 'pointerdown'] as const

/** Linimasa jalan-jalan (ms sejak muncul). Harus sama dengan keyframe cat-wander (8 detik) di globals.css. */
const WANDER: [number, Phase][] = [
  [3000, 'sniff'],
  [4200, 'roam'],
  [6200, 'look'],
  [6800, 'back'],
  [8000, 'drowsy'],
  [9600, 'sleepy'],
  [10700, 'asleep'],
]
/** Linimasa bangun: kaget dan melompat, menyapa senang, lalu pergi. */
const WAKE: [number, Phase | 'off'][] = [
  [700, 'greet'],
  [1500, 'leaving'],
  [2000, 'off'],
]

const MESSAGE: Partial<Record<Phase, string>> = {
  arrive: 'Hm? Sepi sekali… jalan-jalan dulu ah',
  sniff: '*endus endus*',
  roam: 'Cari tempat empuk…',
  look: 'Nah, itu dia!',
  back: 'Nah, itu dia!',
  drowsy: 'Hoaaam… Teemo ngantuk',
  sleepy: 'Hoaaam… Teemo ngantuk',
  greet: 'Eh! Kamu balik!',
}

/**
 * Easter egg: diam 15 detik, layar meredup dan Teemo berjalan-jalan sekitar 8 detik (masuk, mengendus, berbalik
 * mencari tempat, melihat bantal, kembali), lalu naik ke bantal, menguap, dan tidur berbaring menyamping (zZz). Latar halaman diburamkan.
 * Aktivitas apa pun membangunkannya: kaget melompat (!), menyapa dengan mata senang, lalu pergi.
 * Tidak muncul saat tab tersembunyi atau ada audio (mis. Mars) yang diputar.
 * Dengan gerak dikurangi, ia langsung muncul dalam keadaan tidur tanpa animasi dan hilang seketika saat bangun.
 */
export function SleepyOverlay() {
  const [phase, setPhase] = useState<Phase>('off')
  const phaseRef = useRef<Phase>('off')
  const shownAt = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let idle: number | undefined

    const go = (p: Phase) => {
      phaseRef.current = p
      setPhase(p)
    }
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
    const clearAll = () => {
      timers.current.forEach(window.clearTimeout)
      timers.current = []
    }
    const audioPlaying = () => [...document.querySelectorAll('audio')].some((a) => !a.paused)

    const arm = () => {
      window.clearTimeout(idle)
      idle = window.setTimeout(show, IDLE_MS)
    }

    function show() {
      if (document.hidden || audioPlaying()) return arm()
      shownAt.current = Date.now()
      if (reduced) return go('asleep')
      go('arrive')
      WANDER.forEach(([ms, p]) => later(ms, () => go(p)))
    }

    function wake() {
      if (Date.now() - shownAt.current < 500) return // abaikan gerakan sisa saat baru muncul
      clearAll()
      if (reduced) {
        go('off')
      } else {
        go('wake')
        WAKE.forEach(([ms, p]) => later(ms, () => go(p)))
      }
      arm()
    }

    const onActivity = () => {
      const p = phaseRef.current
      if (p === 'off') arm()
      else if (p !== 'wake' && p !== 'greet' && p !== 'leaving') wake()
    }

    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    // Lagu mulai diputar (mis. Mars) juga membangunkan Teemo; event play tidak menggelembung, jadi pakai capture.
    document.addEventListener('play', onActivity, true)
    arm()
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
      document.removeEventListener('play', onActivity, true)
      window.clearTimeout(idle)
      clearAll()
    }
  }, [])

  if (phase === 'off') return null

  const asleep = phase === 'asleep'
  const walking = phase === 'arrive' || phase === 'sniff' || phase === 'roam' || phase === 'look' || phase === 'back'
  const moving = phase === 'arrive' || phase === 'roam' || phase === 'back'
  const sitting = phase === 'drowsy' || phase === 'sleepy' || phase === 'wake' || phase === 'greet' || phase === 'leaving'
  const waking = phase === 'wake' || phase === 'greet' || phase === 'leaving'
  const cushion = !(phase === 'arrive' || phase === 'sniff' || phase === 'roam')
  const lid = phase === 'drowsy' ? 0.5 : phase === 'sleepy' ? 0.88 : 0
  const message = MESSAGE[phase]

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-surface/40 backdrop-blur-md transition-opacity duration-500 ${
        phase === 'leaving' ? 'opacity-0' : 'cat-overlay-in opacity-100'
      } ${waking ? 'pointer-events-none' : ''}`}
    >
      <div className="relative h-64 w-[min(30rem,92vw)] sm:h-76">
        {message && (
          <p
            key={message}
            className="cat-say absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap border border-line bg-surface-raised px-4 py-2 font-mono text-xs text-ink shadow-md"
          >
            {message}
          </p>
        )}

        {/* Bantal: muncul saat Teemo melihatnya, tetap ada sampai ia pergi. */}
        <Cushion
          className={`absolute inset-x-0 bottom-0 mx-auto w-80 transition-all duration-500 sm:w-96 ${
            cushion ? 'opacity-100' : 'translate-y-2 scale-95 opacity-0'
          } ${phase === 'leaving' ? 'scale-95 opacity-0' : ''}`}
        />

        {/* Jalan-jalan 8 detik: satu animasi cat-wander di pembungkus, kaki bergerak hanya saat berpindah. */}
        <div
          className={`cat-walker absolute inset-x-0 bottom-1 mx-auto h-[58%] w-64 transition-opacity duration-300 ${
            walking ? 'cat-wander opacity-100' : 'opacity-0'
          } ${moving ? 'cat-walking' : phase === 'sniff' ? 'cat-sniffing' : phase === 'look' ? 'cat-standing' : ''}`}
        >
          <CatWalk className="size-full" />
        </div>

        <div className="absolute inset-x-0 bottom-6 top-12 mx-auto w-72 sm:bottom-7 sm:w-80">
          {/* Duduk: melompat naik ke bantal saat mulai mengantuk, melompat kaget saat dibangunkan. */}
          <div
            key={phase === 'wake' ? 'wake' : phase === 'drowsy' ? 'drowsy' : 'sit'}
            className={`absolute inset-0 ${phase === 'drowsy' || phase === 'wake' ? 'cat-hop' : ''} ${phase === 'leaving' ? 'cat-leave' : ''}`}
          >
            <CatSit
              still={!waking || phase === 'wake'}
              lid={lid}
              fluff={phase === 'wake'}
              wide={phase === 'wake'}
              happy={phase === 'greet' || phase === 'leaving'}
              yawn={phase === 'drowsy' ? 1 : 0}
              className={`absolute inset-0 size-full transition-all ${phase === 'wake' ? 'duration-100' : 'duration-500'} ${
                sitting ? 'opacity-100' : asleep ? 'translate-y-3 scale-90 opacity-0' : 'translate-y-2 opacity-0'
              }`}
            />
            {phase === 'wake' && (
              <span className="cat-alert absolute -top-2 left-[62%] font-display text-4xl font-bold text-landmark">!</span>
            )}
          </div>
          <CatSleep
            className={`absolute inset-x-0 -bottom-1 h-[64%] w-full ${waking ? 'transition-none' : 'transition-all duration-700'} ${
              asleep ? 'opacity-100' : 'translate-y-2 opacity-0'
            }`}
          />
        </div>

        {asleep && (
          <div className="absolute left-[64%] top-[18%] font-display font-bold text-ink-muted" aria-hidden="true">
            <span className="cat-z absolute left-0 top-0 text-2xl" style={{ animationDelay: '0s' }}>z</span>
            <span className="cat-z absolute left-5 top-0 text-3xl" style={{ animationDelay: '0.9s' }}>Z</span>
            <span className="cat-z absolute left-11 top-0 text-4xl" style={{ animationDelay: '1.8s' }}>Z</span>
          </div>
        )}
      </div>
    </div>
  )
}
