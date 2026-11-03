import Link from 'next/link'

import { type ActivityStats, buildWeeks, dayKey, summarize } from '@/lib/activity-core'
import { getActivity, getActivityYears, getLandmarks, getProkerProgress } from '@/lib/activity'
import type { Period } from '@/payload-types'
import { Reveal } from '../ui/Reveal'
import { Accordion } from '../ui/Accordion'
import { Section } from '../ui/Section'
import { ActivityHeatmap } from './ActivityHeatmap'
import { ORDER, ProkerProgress, STATUS } from './ProkerProgress'

const MONTH_NAME = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', timeZone: 'UTC' })

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface-raised p-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-bold text-link">{value}</dd>
      {note && <p className="mt-0.5 text-xs text-ink-muted">{note}</p>}
    </div>
  )
}

function statsView(s: ActivityStats) {
  return [
    { label: 'Total aktivitas', value: String(s.total), note: `di ${s.activeDays} hari berbeda` },
    {
      label: 'Hari tersibuk',
      value: s.busiest ? String(s.busiest.count) : '0',
      note: s.busiest ? shortDate.format(new Date(`${s.busiest.date}T00:00:00Z`)) : 'Belum ada data',
    },
    { label: 'Minggu aktif beruntun', value: String(s.longestWeekStreak), note: 'rekor terpanjang' },
    { label: 'Bulan teraktif', value: s.topMonth ? MONTH_NAME[s.topMonth.month] : '-', note: s.topMonth ? `${s.topMonth.count} aktivitas` : undefined },
  ]
}

/** Pemilih tahun heatmap: panah + daftar tahun, berbasis link supaya bisa dibagikan lewat URL. */
function YearStepper({ years, current, hrefFor }: { years: number[]; current: number; hrefFor: (y: number) => string }) {
  const i = years.indexOf(current)
  const prev = years[i - 1]
  const next = years[i + 1]
  const arrow = 'flex size-9 items-center justify-center border border-line text-ink'
  return (
    <nav aria-label="Tahun heatmap" className="flex items-center gap-1.5">
      {prev ? (
        <Link href={hrefFor(prev)} scroll={false} aria-label={`Tahun ${prev}`} className={`${arrow} hover:border-brand`}>
          ←
        </Link>
      ) : (
        <span aria-hidden="true" className={`${arrow} opacity-35`}>
          ←
        </span>
      )}
      <ul className="flex gap-1.5">
        {years.map((y) => (
          <li key={y}>
            <Link
              href={hrefFor(y)}
              scroll={false}
              aria-current={y === current ? 'page' : undefined}
              className={`flex h-9 items-center border px-3 font-mono text-sm ${y === current ? 'border-brand bg-brand text-on-brand' : 'border-line text-ink hover:border-brand'}`}
            >
              {y}
            </Link>
          </li>
        ))}
      </ul>
      {next ? (
        <Link href={hrefFor(next)} scroll={false} aria-label={`Tahun ${next}`} className={`${arrow} hover:border-brand`}>
          →
        </Link>
      ) : (
        <span aria-hidden="true" className={`${arrow} opacity-35`}>
          →
        </span>
      )}
    </nav>
  )
}

/** Progres program kerja periode, terlipat secara bawaan supaya tidak memakan tempat. */
async function ProkerAccordion({ period }: { period: Period }) {
  const groups = await getProkerProgress(period.id)
  if (groups.length === 0) return null
  const all = groups.flatMap((g) => g.items)
  const counts = ORDER.map((s) => all.filter((i) => i.status === s).length)
  return (
    <Accordion
      className="mt-10"
      items={[
        {
          id: 'proker',
          title: `Progres program kerja ${period.year}`,
          meta: (
            <span className="flex items-center gap-3">
              <span className="shrink-0">
                {counts[0]} dari {all.length} selesai
              </span>
              <span className="flex h-1.5 w-full max-w-56 gap-px overflow-hidden bg-line" aria-hidden="true">
                {ORDER.map((s, i) => (counts[i] ? <span key={s} className={STATUS[s].bar} style={{ width: `${(counts[i] / all.length) * 100}%` }} /> : null))}
              </span>
            </span>
          ),
          content: <ProkerProgress groups={groups} year={period.year} today={dayKey(new Date())} />,
        },
      ]}
    />
  )
}

type Props = {
  period: Period | null
  /** Tahun yang dipilih lewat ?tahun=; jatuh ke tahun periode bila kosong atau tidak tersedia. */
  year?: number
  /** Membuat URL untuk berganti tahun. Sertakan parameter lain yang perlu dipertahankan. */
  hrefFor: (year: number) => string
  tone?: 'alt'
}

/** Heatmap aktivitas satu tahun (kegiatan + berita + hari penting) disusul progres program kerja yang terlipat. */
export async function ActivitySection({ period, year: picked, hrefFor, tone }: Props) {
  const years = await getActivityYears()
  const year = picked && years.includes(picked) ? picked : (period?.year ?? new Date().getFullYear())
  const [map, landmarks] = await Promise.all([getActivity(year), getLandmarks(year)])
  const stats = summarize(map, year)
  return (
    <Section id="denyut" tone={tone} eyebrow={`Tahun ${year}`} title="Denyut Himpunan">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-ink-muted">
          Setiap kotak adalah satu hari. Makin pekat berarti makin banyak sesi (pagi, siang, sore, malam) yang terisi kegiatan atau berita. Bintang menandai hari
          besar himpunan.
        </p>
        <YearStepper years={years} current={year} hrefFor={hrefFor} />
      </div>
      <dl className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsView(stats).map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </dl>
      <Reveal>
        <div className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
          <ActivityHeatmap key={year} year={year} weeks={buildWeeks(year)} map={map} landmarks={landmarks} />
        </div>
      </Reveal>
      {period && <ProkerAccordion period={period} />}
    </Section>
  )
}
