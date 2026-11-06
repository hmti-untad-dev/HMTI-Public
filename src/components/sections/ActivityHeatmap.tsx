'use client'

import Link from '@/components/ui/AppLink'
import { useCallback, useMemo, useRef, useState } from 'react'

import { type ActivityItem, DAYPARTS, type Landmark, dayLevel, slotsOf } from '@/lib/activity-core'

type Props = {
  year: number
  weeks: (string | null)[][]
  map: Record<string, ActivityItem[]>
  landmarks: Record<string, Landmark[]>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const LEVEL_BG = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const
const longDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const KIND = { kegiatan: 'Kegiatan', berita: 'Berita' } as const

/**
 * Bendera tonggak untuk hari besar himpunan (penanda "titik sejarah", bukan hiasan). Terisi = sudah terlaksana,
 * kosong bergaris putus = akan datang, jadi bedanya terbaca tanpa bergantung warna. Sedikit lebih besar dari kotak.
 */
export function LandmarkMark({ upcoming = false, className = '' }: { upcoming?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6.2 21.5V2.6" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path
        d="M7.2 3.4H20.4L16.2 8.9L20.4 14.4H7.2Z"
        fill={upcoming ? 'var(--bg)' : 'var(--landmark)'}
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeDasharray={upcoming ? '2.4 1.8' : undefined}
      />
    </svg>
  )
}

/**
 * Heatmap aktivitas setahun (kegiatan + berita). Warna kotak = berapa sesi hari itu yang terisi (pagi, siang,
 * sore, malam), jadi skalanya tetap 0 sampai 4. Rincian hari tampil di panel tetap di bawah grid (bukan tooltip
 * melayang) supaya bekerja di layar sentuh dan keyboard: tombol panah berpindah antar hari.
 */
export function ActivityHeatmap({ year, weeks, map, landmarks }: Props) {
  const [cursor, setCursor] = useState<string | null>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())

  // Posisi tiap tanggal untuk navigasi keyboard.
  const pos = useMemo(() => {
    const m = new Map<string, [number, number]>()
    weeks.forEach((w, wi) => w.forEach((d, di) => d && m.set(d, [wi, di])))
    return m
  }, [weeks])

  const monthStarts = useMemo(() => {
    const out: { month: number; col: number }[] = []
    weeks.forEach((w, wi) => {
      const first = w.find((d) => d?.endsWith('-01'))
      if (first) out.push({ month: Number(first.slice(5, 7)) - 1, col: wi })
    })
    return out
  }, [weeks])

  const move = useCallback(
    (from: string, dw: number, dd: number) => {
      const p = pos.get(from)
      if (!p) return
      let [w, d] = [p[0] + dw, p[1] + dd]
      // Lompati sel kosong di tepi tahun.
      while (w >= 0 && w < weeks.length && d >= 0 && d < 7 && !weeks[w][d]) w += dw || 0, d += dd || 0
      const target = weeks[w]?.[d]
      if (target) {
        refs.current.get(target)?.focus()
        setCursor(target)
      }
    },
    [pos, weeks],
  )

  const firstDate = useMemo(() => {
    const withData = [...Object.keys(map), ...Object.keys(landmarks)].sort()[0]
    return withData ?? weeks.flat().find(Boolean) ?? null
  }, [map, landmarks, weeks])

  const items = cursor ? (map[cursor] ?? []) : []
  const marks = cursor ? (landmarks[cursor] ?? []) : []
  const slots = slotsOf(items)

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[44rem]">
          {/* Label bulan */}
          <div className="ml-9 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }} aria-hidden="true">
            {monthStarts.map((m) => (
              <span key={m.month} className="text-xs text-ink-muted" style={{ gridColumn: `${m.col + 1} / span 4`, gridRow: 1 }}>
                {MONTHS[m.month]}
              </span>
            ))}
          </div>

          <div className="mt-1 flex gap-2">
            <div className="grid w-7 shrink-0 grid-rows-7 gap-[3px] text-xs text-ink-muted" aria-hidden="true">
              {['Sen', '', 'Rab', '', 'Jum', '', ''].map((l, i) => (
                <span key={i} className="flex items-center">
                  {l}
                </span>
              ))}
            </div>

            <div
              role="grid"
              data-cv-skip
              aria-label={`Aktivitas himpunan tahun ${year}`}
              className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
              onMouseLeave={() => setCursor(null)}
            >
              {weeks.flatMap((week, wi) =>
                week.map((date, di) => {
                  if (!date) return <span key={`${wi}-${di}`} aria-hidden="true" />
                  const dayItems = map[date] ?? []
                  const dayMarks = landmarks[date] ?? []
                  const lvl = dayLevel(dayItems)
                  const isCursor = cursor === date
                  const label = [
                    longDate.format(new Date(`${date}T00:00:00Z`)),
                    `${dayItems.length} aktivitas`,
                    ...(lvl > 0 ? [`${slotsOf(dayItems).size || 1} sesi terisi`] : []),
                    ...dayMarks.map((m) => `hari penting: ${m.title}`),
                  ].join(', ')
                  return (
                    <button
                      key={date}
                      ref={(el) => {
                        if (el) refs.current.set(date, el)
                        else refs.current.delete(date)
                      }}
                      type="button"
                      role="gridcell"
                      tabIndex={date === (cursor ?? firstDate) ? 0 : -1}
                      aria-label={label}
                      style={{ ['--w' as string]: wi }}
                      onMouseEnter={() => setCursor(date)}
                      onFocus={() => setCursor(date)}
                      onKeyDown={(e) => {
                        const k = e.key
                        if (k === 'ArrowRight') move(date, 1, 0)
                        else if (k === 'ArrowLeft') move(date, -1, 0)
                        else if (k === 'ArrowDown') move(date, 0, 1)
                        else if (k === 'ArrowUp') move(date, 0, -1)
                        else return
                        e.preventDefault()
                      }}
                      className={`heat-cell relative aspect-square w-full rounded-[3px] transition-[transform,box-shadow] duration-150 ${LEVEL_BG[lvl]} ${
                        isCursor ? 'z-20 scale-125 shadow-[0_0_0_1.5px_var(--ink)]' : 'hover:scale-110'
                      } ${dayMarks.length ? 'z-10' : ''}`}
                    >
                      {dayMarks.length > 0 && (
                        <LandmarkMark upcoming={dayMarks.every((m) => m.upcoming)} className="pointer-events-none absolute left-1/2 top-1/2 size-[1.45rem] -translate-x-[38%] -translate-y-1/2 drop-shadow-[0_0_1px_var(--bg)]" />
                      )}
                    </button>
                  )
                }),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rincian + legenda */}
      <div className="mt-4 flex flex-col gap-4 border-t border-line pt-4 lg:flex-row lg:items-start lg:justify-between">
        <div aria-live="polite" className="min-h-14 text-sm">
          {cursor ? (
            <>
              <p className="font-medium">{longDate.format(new Date(`${cursor}T00:00:00Z`))}</p>

              {marks.map((m) => (
                <div key={m.title} className="mt-1.5 flex items-start gap-2">
                  <LandmarkMark upcoming={m.upcoming} className="mt-0.5 size-4 shrink-0" />
                  <p>
                    <span className="font-medium">{m.title}</span>
                    <span className="text-ink-muted"> · {m.upcoming ? 'akan datang' : 'sudah terlaksana'}</span>
                    {m.description && <span className="block text-ink-muted">{m.description}</span>}
                    {m.href && (
                      <Link href={m.href} className="text-link hover:underline">
                        Lihat kegiatan
                      </Link>
                    )}
                  </p>
                </div>
              ))}

              {items.length === 0 ? (
                marks.length === 0 && <p className="text-ink-muted">Tidak ada aktivitas tercatat.</p>
              ) : (
                <>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Sesi yang terisi">
                    {DAYPARTS.map((d) => {
                      const on = slots.has(d.key)
                      return (
                        <li
                          key={d.key}
                          title={d.range}
                          className={`border px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider ${on ? 'border-brand bg-brand text-on-brand' : 'border-dashed border-line text-ink-muted'}`}
                        >
                          {d.label}
                          <span className="sr-only">{on ? ' terisi' : ' kosong'}</span>
                        </li>
                      )
                    })}
                    {slots.size === 0 && <li className="self-center text-xs text-ink-muted">Sesi belum diisi, dihitung 1.</li>}
                  </ul>
                  <ul className="mt-2 space-y-0.5 text-ink-muted">
                    {items.slice(0, 4).map((it, i) => (
                      <li key={i}>
                        <span className="font-mono text-xs uppercase tracking-wider text-link">{KIND[it.kind]}</span>{' '}
                        <Link href={it.href} className="text-ink hover:underline">
                          {it.title}
                        </Link>
                      </li>
                    ))}
                    {items.length > 4 && <li>dan {items.length - 4} lainnya</li>}
                  </ul>
                </>
              )}
            </>
          ) : (
            <p className="text-ink-muted">Arahkan kursor ke sebuah hari, atau gunakan tombol panah, untuk melihat rincian.</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 text-xs text-ink-muted" aria-hidden="true">
          <div className="flex items-center gap-2">
            0 sesi
            {LEVEL_BG.map((c) => (
              <span key={c} className={`size-3 rounded-[3px] ${c}`} />
            ))}
            4 sesi
          </div>
          <p>Sesi: pagi, siang, sore, malam</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <LandmarkMark className="size-4" /> Hari penting
            </span>
            <span className="flex items-center gap-1.5">
              <LandmarkMark upcoming className="size-4" /> Akan datang
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
