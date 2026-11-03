import { type ActivityStats, buildWeeks, dayKey, summarize } from '@/lib/activity-core'
import { getActivity, getProkerProgress } from '@/lib/activity'
import type { Period } from '@/payload-types'
import { Empty } from '../ui/Empty'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'
import { ActivityHeatmap } from './ActivityHeatmap'
import { ProkerProgress } from './ProkerProgress'

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

/** Heatmap aktivitas tahun periode. Data diambil dari Edisi Kegiatan dan Berita terbit. */
export async function ActivitySection({ period, tone }: { period: Period | null; tone?: 'alt' }) {
  const year = period?.year ?? new Date().getFullYear()
  const map = await getActivity(year)
  const stats = summarize(map, year)
  return (
    <Section id="denyut" tone={tone} eyebrow={`Tahun ${year}`} title="Denyut Himpunan">
      <p className="mb-8 max-w-2xl text-ink-muted">
        Setiap kotak adalah satu hari. Makin pekat berarti makin banyak kegiatan dan berita pada hari itu.
      </p>
      <dl className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsView(stats).map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </dl>
      <Reveal>
        <div className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
          <ActivityHeatmap year={year} weeks={buildWeeks(year)} map={map} />
        </div>
      </Reveal>
    </Section>
  )
}

/** Progres program kerja periode: dikelompokkan per departemen. */
export async function ProkerSection({ period, tone }: { period: Period | null; tone?: 'alt' }) {
  const groups = period ? await getProkerProgress(period.id) : []
  return (
    <Section id="progres" tone={tone} eyebrow={period ? `Periode ${period.year}` : undefined} title="Progres Program Kerja">
      {groups.length === 0 || !period ? (
        <Empty>Belum ada program kerja pada periode ini.</Empty>
      ) : (
        <ProkerProgress groups={groups} year={period.year} today={dayKey(new Date())} />
      )}
    </Section>
  )
}
