'use client'

import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'

import { type ActivityItem, levelOf } from '@/lib/activity-core'

type Props = {
  year: number
  weeks: (string | null)[][]
  map: Record<string, ActivityItem[]>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const LEVEL_BG = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const
const longDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const KIND = { kegiatan: 'Kegiatan', berita: 'Berita' } as const

/**
 * Heatmap aktivitas setahun (kegiatan + berita). Rincian hari tampil di panel tetap di bawah grid
 * (bukan tooltip melayang) supaya bekerja di layar sentuh dan keyboard: tombol panah berpindah antar hari.
 */
export function ActivityHeatmap({ year, weeks, map }: Props) {
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
    const withData = Object.keys(map).sort()[0]
    return withData ?? weeks.flat().find(Boolean) ?? null
  }, [map, weeks])

  const items = cursor ? (map[cursor] ?? []) : []
  const max = useMemo(() => Math.max(1, ...Object.values(map).map((v) => v.length)), [map])

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
              aria-label={`Aktivitas himpunan tahun ${year}`}
              className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
              onMouseLeave={() => setCursor(null)}
            >
              {weeks.flatMap((week, wi) =>
                week.map((date, di) => {
                  if (!date) return <span key={`${wi}-${di}`} aria-hidden="true" />
                  const count = map[date]?.length ?? 0
                  const lvl = levelOf(count, max)
                  const isCursor = cursor === date
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
                      aria-label={`${longDate.format(new Date(`${date}T00:00:00Z`))}: ${count} aktivitas`}
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
                      className={`aspect-square w-full rounded-[3px] transition-[transform,box-shadow] duration-150 ${LEVEL_BG[lvl]} ${
                        isCursor ? 'scale-125 shadow-[0_0_0_1.5px_var(--ink)]' : 'hover:scale-110'
                      }`}
                    />
                  )
                }),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rincian + legenda */}
      <div className="mt-4 flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-start sm:justify-between">
        <div aria-live="polite" className="min-h-14 text-sm">
          {cursor ? (
            <>
              <p className="font-medium">{longDate.format(new Date(`${cursor}T00:00:00Z`))}</p>
              {items.length === 0 ? (
                <p className="text-ink-muted">Tidak ada aktivitas tercatat.</p>
              ) : (
                <ul className="mt-1 space-y-0.5 text-ink-muted">
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
              )}
            </>
          ) : (
            <p className="text-ink-muted">Arahkan kursor ke sebuah hari, atau gunakan tombol panah, untuk melihat rincian.</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-xs text-ink-muted" aria-hidden="true">
          Sedikit
          {LEVEL_BG.map((c) => (
            <span key={c} className={`size-3 rounded-[3px] ${c}`} />
          ))}
          Banyak
        </div>
      </div>
    </div>
  )
}
