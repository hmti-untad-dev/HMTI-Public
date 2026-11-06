'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Cue = { t: number; line: number }
type Props = {
  src: string
  title: string
  composer: string
  youtube?: string
  bait: string[][]
  cues: Cue[]
  end: number
}

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/**
 * Pemutar Mars ala lirik Spotify. Sebelum diputar: seluruh lirik tampil utuh per bait agar bisa dibaca dulu.
 * Saat diputar: baris yang sedang dinyanyikan menyala, yang lewat meredup, panel lirik bergulir sendiri
 * (berhenti mengikuti beberapa detik bila pengguna menggulir sendiri). Klik baris untuk lompat ke sana.
 * Kotak musik kustom: sampul chip HMTI, ekualiser, bilah kemajuan yang bisa digeser, waktu, dan senyap.
 * Waktu lirik dari MARS_CUES (content/tentang.ts); ?sinkron=1 menampilkan alat penanda waktu untuk pengurus.
 */
export function MarsPlayer({ src, title, composer, youtube, bait, cues, end }: Props) {
  const audio = useRef<HTMLAudioElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const userScrollAt = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(end)
  const [muted, setMuted] = useState(false)
  const [sync, setSync] = useState<number[] | null>(null)

  const lines = useMemo(() => bait.flatMap((b, bi) => b.map((text, li) => ({ text, bait: bi, first: li === 0 }))), [bait])

  // Cue aktif: cue terakhir yang waktunya sudah lewat. Pengulangan (putaran kedua/penutup) ditandai.
  const cueIdx = useMemo(() => {
    let i = -1
    for (let k = 0; k < cues.length; k++) if (cues[k].t <= time + 0.05) i = k
    return i
  }, [cues, time])
  // Lirik mengikuti lagu begitu diputar atau digeser; sebelum itu tampil utuh.
  const live = started || time > 0.2
  const active = live && cueIdx >= 0 && time < end ? cues[cueIdx].line : -1
  const repeat = cueIdx >= lines.length
  const intro = live && cueIdx < 0

  useEffect(() => {
    setSync(new URLSearchParams(window.location.search).has('sinkron') ? [] : null)
    // Metadata bisa sudah termuat sebelum hydration, sehingga onLoadedMetadata terlewat.
    const a = audio.current
    if (a && a.readyState >= 1 && a.duration) setDuration(a.duration)
  }, [])

  // Waktu halus selama diputar (timeupdate hanya ~4x/dtk). rAF berhenti saat jeda.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const a = audio.current
      if (a) setTime(a.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // Gulir panel (bukan halaman) agar baris aktif berada sekitar sepertiga atas.
  useEffect(() => {
    const p = panel.current
    if (!p || active < 0 || Date.now() - userScrollAt.current < 3500) return
    const el = p.querySelector<HTMLElement>(`[data-line="${active}"]`)
    if (!el) return
    const top = el.offsetTop - p.clientHeight * 0.32
    p.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [active])

  // Kontrol di layar kunci / headset.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist: composer.replace(/^Cipt\.\s*/, ''), album: 'HMTI UNTAD', artwork: [{ src: '/brand/hmti-logo.webp', sizes: '512x512', type: 'image/webp' }] })
    navigator.mediaSession.setActionHandler('play', () => audio.current?.play())
    navigator.mediaSession.setActionHandler('pause', () => audio.current?.pause())
  }, [title, composer])

  const toggle = useCallback(() => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      setStarted(true)
      void a.play()
    } else a.pause()
  }, [])

  const seek = (t: number) => {
    const a = audio.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(t, (a.duration || duration) - 0.1))
    setTime(a.currentTime)
    setStarted(true)
    userScrollAt.current = 0
    if (a.paused) void a.play()
  }

  const seekFromPointer = (clientX: number) => {
    const r = bar.current?.getBoundingClientRect()
    if (!r) return
    seek(((clientX - r.left) / r.width) * duration)
  }

  const onBarKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') seek(time + 5)
    else if (e.key === 'ArrowLeft') seek(time - 5)
    else if (e.key === 'Home') seek(0)
    else return
    e.preventDefault()
  }

  // Alat sinkron: T menandai awal baris berikutnya.
  useEffect(() => {
    if (sync === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 't' || !audio.current || (e.target as HTMLElement).closest('input, textarea')) return
      setSync((s) => [...(s ?? []), +audio.current!.currentTime.toFixed(2)])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sync])

  const progress = duration ? Math.min(1, time / duration) : 0

  return (
    <div className="mars" data-playing={playing} data-started={live}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setStarted(false)
          setTime(0)
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || end)}
        onTimeUpdate={(e) => !playing && setTime(e.currentTarget.currentTime)}
      />

      {/* Kotak musik */}
      <div className="mars-box">
        <div className="mars-cover" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hmti-logo.webp" alt="" width={96} height={96} />
          <span className="mars-eq">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] opacity-70">Mars himpunan</p>
          <p className="mt-1 truncate font-display text-xl font-bold">{title}</p>
          <p className="truncate text-sm opacity-75">{composer}</p>
        </div>

        <div className="mars-controls">
          <button type="button" onClick={toggle} className="mars-play" aria-label={playing ? 'Jeda' : 'Putar mars'}>
            {playing ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            )}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div
              ref={bar}
              className="mars-bar"
              role="slider"
              tabIndex={0}
              aria-label="Posisi lagu"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${fmt(time)} dari ${fmt(duration)}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                seekFromPointer(e.clientX)
              }}
              onPointerMove={(e) => e.buttons === 1 && seekFromPointer(e.clientX)}
              onKeyDown={onBarKey}
            >
              <span className="mars-bar-fill" style={{ transform: `scaleX(${progress})` }} />
              <span className="mars-bar-knob" style={{ left: `${progress * 100}%` }} />
            </div>
            <div className="flex justify-between font-mono text-[0.68rem] tabular-nums opacity-75">
              <span>{fmt(time)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>
          <button
            type="button"
            className="mars-mute"
            aria-pressed={muted}
            aria-label={muted ? 'Bunyikan' : 'Senyapkan'}
            onClick={() => {
              const a = audio.current
              if (!a) return
              a.muted = !a.muted
              setMuted(a.muted)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" />
              {muted ? <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" strokeWidth="2" /> : <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" />}
            </svg>
          </button>
        </div>

        {youtube && (
          <a href={youtube} target="_blank" rel="noopener noreferrer" className="mars-yt">
            Tonton di YouTube
          </a>
        )}
      </div>

      {/* Lirik */}
      <div className="mars-lyrics">
        <div className="mars-lyrics-head">
          <span>Lirik</span>
          <span aria-live="polite">{!live ? 'baca dulu, lalu putar' : intro ? 'intro' : repeat ? 'diulang' : playing ? 'sedang diputar' : 'dijeda'}</span>
        </div>
        <div
          ref={panel}
          className="mars-scroll"
          data-lenis-prevent
          onWheel={() => (userScrollAt.current = Date.now())}
          onTouchMove={() => (userScrollAt.current = Date.now())}
        >
          {intro && (
            <p className="mars-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </p>
          )}
          {lines.map((l, i) => {
            const state = active < 0 ? 'idle' : i === active ? 'now' : i < active ? 'past' : 'next'
            const cue = cues.find((c) => c.line === i)
            return (
              <button
                key={i}
                type="button"
                data-line={i}
                data-state={state}
                className={`mars-line ${l.first && i > 0 ? 'mt-7' : ''}`}
                onClick={() => cue && seek(cue.t)}
                aria-current={state === 'now' ? 'true' : undefined}
              >
                {l.text}
              </button>
            )
          })}
          <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] opacity-60">{composer}</p>
        </div>
      </div>

      {sync !== null && (
        <div className="col-span-full border border-dashed border-line p-4 text-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-link">Mode sinkron</p>
          <p className="mt-1 text-ink-muted">Putar lagu, tekan T tepat saat tiap baris mulai dinyanyikan (termasuk pengulangan). Salin hasilnya ke MARS_CUES di content/tentang.ts.</p>
          <textarea readOnly className="mt-2 h-24 w-full border border-line bg-surface p-2 font-mono text-xs" value={JSON.stringify(sync)} />
          <button type="button" className="mt-2 border border-line px-3 py-1 text-xs" onClick={() => setSync([])}>
            Ulang
          </button>
        </div>
      )}
    </div>
  )
}
