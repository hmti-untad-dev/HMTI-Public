'use client'

import { useEffect, useRef, useState } from 'react'

import { CatLoaf, CatSit, CatWalk } from './Cat'

type Phase = 'off' | 'arrive' | 'sniff' | 'turn' | 'drowsy' | 'sleepy' | 'asleep' | 'wake' | 'leaving'

const IDLE_MS = 10_000
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel', 'pointerdown'] as const

/**
 * Easter egg: diam 10 detik, layar mengabur dan Teemo berjalan masuk, mengendus-endus, berbalik sebentar,
 * lalu duduk menguap dan tidur dalam pose roti (loaf) yang empuk (zZz).
 * Aktivitas apa pun membangunkannya. Tidak muncul saat tab tersembunyi atau ada audio (mis. Mars) yang diputar.
 * Dengan gerak dikurangi, ia langsung muncul dalam keadaan tidur tanpa animasi.
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
      later(2600, () => go('sniff'))
      later(3900, () => go('turn'))
      later(5200, () => go('drowsy'))
      later(7000, () => go('sleepy'))
      later(8100, () => go('asleep'))
    }

    function wake() {
      if (Date.now() - shownAt.current < 500) return // abaikan gerakan sisa saat baru muncul
      clearAll()
      if (reduced) {
        go('off')
      } else {
        go('wake')
        later(650, () => go('leaving'))
        later(1200, () => go('off'))
      }
      arm()
    }

    const onActivity = () => {
      if (phaseRef.current === 'off') arm()
      else if (phaseRef.current !== 'wake' && phaseRef.current !== 'leaving') wake()
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
  const walking = phase === 'arrive' || phase === 'sniff' || phase === 'turn'
  const sitting = phase === 'drowsy' || phase === 'sleepy' || phase === 'wake' || phase === 'leaving'
  const lid = phase === 'drowsy' ? 0.5 : phase === 'sleepy' ? 0.88 : 0
  const message =
    phase === 'arrive'
      ? 'Hm? Sepi sekali… jalan-jalan dulu ah'
      : phase === 'sniff'
        ? '*endus endus*'
        : phase === 'turn'
          ? 'Cari tempat empuk…'
          : phase === 'drowsy' || phase === 'sleepy'
            ? 'Hoaaam… Teemo ngantuk'
            : phase === 'wake'
              ? 'Eh! Kamu balik!'
              : null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-surface/70 transition-opacity duration-500 ${
        phase === 'leaving' ? 'opacity-0' : 'cat-overlay-in opacity-100'
      }`}
    >
      <div className="relative h-60 w-[min(30rem,92vw)] sm:h-72">
        {message && (
          <p className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap border border-line bg-surface-raised px-4 py-2 font-mono text-xs text-ink shadow-md">
            {message}
          </p>
        )}

        {/* Berjalan: masuk dari kiri, berhenti mengendus, lalu berbalik beberapa langkah. */}
        <div
          data-p={phase}
          className={`cat-walker absolute inset-x-0 bottom-0 mx-auto h-[62%] w-64 transition-opacity duration-300 ${walking ? 'opacity-100' : 'opacity-0'} ${
            phase === 'sniff' ? 'cat-sniffing' : walking ? 'cat-walking' : ''
          }`}
        >
          <CatWalk className="size-full" />
        </div>

        <div className="absolute inset-x-0 bottom-0 top-10 mx-auto w-72 sm:w-80">
          <CatSit
            still
            lid={lid}
            fluff={phase === 'wake'}
            wide={phase === 'wake'}
            yawn={phase === 'drowsy' ? 1 : 0}
            className={`absolute inset-0 size-full transition-all duration-700 ${sitting ? 'opacity-100' : asleep ? 'translate-y-3 scale-90 opacity-0' : 'translate-y-2 opacity-0'}`}
          />
          <CatLoaf className={`absolute inset-x-0 bottom-0 h-[78%] w-full transition-all duration-700 ${asleep ? 'opacity-100' : 'translate-y-2 opacity-0'}`} />
        </div>

        {asleep && (
          <div className="absolute left-[30%] top-[22%] font-display font-bold text-ink-muted" aria-hidden="true">
            <span className="cat-z absolute left-0 top-0 text-2xl" style={{ animationDelay: '0s' }}>z</span>
            <span className="cat-z absolute left-5 top-0 text-3xl" style={{ animationDelay: '0.9s' }}>Z</span>
            <span className="cat-z absolute left-11 top-0 text-4xl" style={{ animationDelay: '1.8s' }}>Z</span>
          </div>
        )}
      </div>
    </div>
  )
}
