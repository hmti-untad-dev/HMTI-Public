import Link from 'next/link'

import type { ProkerGroup, ProkerStatus } from '@/lib/activity-core'

export const STATUS: Record<ProkerStatus, { label: string; dot: string; bar: string }> = {
  selesai: { label: 'Selesai', dot: 'border-link bg-link', bar: 'bg-link' },
  berjalan: { label: 'Berjalan', dot: 'border-link bg-link/35', bar: 'bg-link/45' },
  rencana: { label: 'Rencana', dot: 'border-ink-muted bg-surface', bar: 'bg-line' },
  ditunda: { label: 'Ditunda', dot: 'rotate-45 border-dashed border-ink-muted bg-surface', bar: 'bg-inactive' },
}
export const ORDER: ProkerStatus[] = ['selesai', 'berjalan', 'rencana', 'ditunda']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const dayOfYear = (key: string) => {
  const d = new Date(`${key}T00:00:00Z`)
  return Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000)
}
const pct = (key: string, year: number) => {
  const total = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000
  return Math.min(100, Math.max(0, (dayOfYear(key) / total) * 100))
}
const range = (start: string | null, end: string | null) => {
  if (!start) return 'Tanggal belum ditetapkan'
  const a = shortDate.format(new Date(`${start}T00:00:00Z`))
  return end && end !== start ? `${a} – ${shortDate.format(new Date(`${end}T00:00:00Z`))}` : a
}

/**
 * Progres program kerja per departemen: ringkasan bilah bersegmen, garis waktu setahun (penanda berbentuk
 * berbeda per status, bukan warna saja), dan daftar rincian. Garis waktu disembunyikan di layar sempit.
 */
export function ProkerProgress({ groups, year, today }: { groups: ProkerGroup[]; year: number; today: string }) {
  const all = groups.flatMap((g) => g.items)
  const done = all.filter((i) => i.status === 'selesai').length
  const showToday = today.startsWith(`${year}-`)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="font-display text-3xl font-bold sm:text-4xl">
          {done} <span className="text-xl font-medium text-ink-muted">dari {all.length} program kerja selesai</span>
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted" aria-label="Keterangan status">
          {ORDER.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className={`size-3 rounded-full border ${STATUS[s].dot}`} aria-hidden="true" />
              {STATUS[s].label}
            </li>
          ))}
        </ul>
      </div>

      {/* Sumbu bulan (desktop) */}
      <div className="mt-8 hidden grid-cols-12 pl-52 text-xs text-ink-muted md:grid" aria-hidden="true">
        {MONTHS.map((m) => (
          <span key={m} className="border-l border-line pl-1.5">
            {m}
          </span>
        ))}
      </div>

      <ul className="mt-2 divide-y divide-line border-y border-line">
        {groups.map((g) => {
          const counts = ORDER.map((s) => g.items.filter((i) => i.status === s).length)
          const finished = counts[0]
          return (
            <li key={g.key} className="py-5">
              <div className="md:grid md:grid-cols-[13rem_1fr] md:items-center md:gap-x-0">
                <div className="md:pr-4">
                  <h3 className="font-display text-lg font-semibold">{g.name}</h3>
                  <p className="text-sm text-ink-muted">
                    {finished} dari {g.items.length} selesai
                  </p>
                  <div className="mt-2 flex h-1.5 w-full max-w-48 gap-px overflow-hidden rounded-full bg-line" role="img" aria-label={`${finished} dari ${g.items.length} selesai`}>
                    {ORDER.map((s, i) =>
                      counts[i] ? <span key={s} className={STATUS[s].bar} style={{ width: `${(counts[i] / g.items.length) * 100}%` }} /> : null,
                    )}
                  </div>
                </div>

                {/* Garis waktu */}
                <div className="relative mt-4 hidden h-9 md:mt-0 md:block" aria-hidden="true">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
                  <div className="absolute inset-0 grid grid-cols-12">
                    {MONTHS.map((m) => (
                      <span key={m} className="border-l border-line/60" />
                    ))}
                  </div>
                  {showToday && <span className="absolute inset-y-0 w-px bg-link" style={{ left: `${pct(today, year)}%` }} />}
                  {g.items.map((it) =>
                    it.start ? (
                      <span
                        key={it.id}
                        title={`${it.title} · ${STATUS[it.status].label} · ${range(it.start, it.end)}`}
                        className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${STATUS[it.status].dot}`}
                        style={{ left: `${pct(it.start, year)}%` }}
                      />
                    ) : null,
                  )}
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 md:ml-52">
                {g.items.map((it) => (
                  <li key={it.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                    <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-ink-muted">
                      <span className={`size-2.5 rounded-full border ${STATUS[it.status].dot}`} aria-hidden="true" />
                      {STATUS[it.status].label}
                    </span>
                    <Link href={it.href} className="text-ink hover:text-link hover:underline">
                      {it.title}
                    </Link>
                    <span className="text-ink-muted">{range(it.start, it.end)}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
