'use client'

import { useEffect, useRef, useState } from 'react'

import { CatLoaf, CatSit } from './Cat'

type Phase = 'off' | 'alert' | 'drowsy' | 'sleepy' | 'asleep' | 'wake' | 'leaving'

const IDLE_MS = 10_000
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel', 'pointerdown'] as const

/**
 * Easter egg: diam 10 detik, layar mengabur dan Teemo muncul di tengah, menguap, lalu tertidur (zZz).
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
      go('alert')
      later(1400, () => go('drowsy'))
      later(3300, () => go('sleepy'))
      later(4500, () => go('asleep'))
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
    arm()
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
      window.clearTimeout(idle)
      clearAll()
    }
  }, [])

  if (phase === 'off') return null

  const asleep = phase === 'asleep'
  const lid = phase === 'drowsy' ? 0.83 : phase === 'sleepy' ? 1 : 0
  const message =
    phase === 'drowsy' || phase === 'sleepy' ? 'Hoaaam… Teemo ngantuk' : phase === 'wake' ? 'Eh! Kamu balik!' : phase === 'alert' ? 'Hm? Sepi sekali…' : null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-surface/60 backdrop-blur-md transition-opacity duration-500 ${
        phase === 'leaving' ? 'opacity-0' : 'cat-overlay-in opacity-100'
      }`}
    >
      <div className="relative h-60 w-72 sm:h-72 sm:w-80">
        <div className="absolute inset-x-6 bottom-0 top-8 rounded-full bg-brand-soft/60 blur-2xl" />

        {message && (
          <p className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap border border-line bg-surface-raised px-4 py-2 font-mono text-xs text-ink shadow-md">
            {message}
          </p>
        )}

        <CatSit
          still
          lid={lid}
          yawn={phase === 'drowsy' ? 1 : 0}
          className={`absolute inset-0 size-full transition-all duration-700 ${asleep ? 'translate-y-3 scale-90 opacity-0' : 'opacity-100'}`}
        />
        <CatLoaf className={`absolute inset-0 size-full transition-all duration-700 ${asleep ? 'opacity-100' : 'translate-y-2 opacity-0'}`} />

        {asleep && (
          <div className="absolute left-[14%] top-[26%] font-display font-bold text-ink-muted" aria-hidden="true">
            <span className="cat-z absolute left-0 top-0 text-2xl" style={{ animationDelay: '0s' }}>z</span>
            <span className="cat-z absolute left-5 top-0 text-3xl" style={{ animationDelay: '0.9s' }}>Z</span>
            <span className="cat-z absolute left-11 top-0 text-4xl" style={{ animationDelay: '1.8s' }}>Z</span>
          </div>
        )}
      </div>
    </div>
  )
}
