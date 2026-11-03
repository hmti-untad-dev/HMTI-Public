import type { Edition } from '@/payload-types'

/** Hari dihitung menurut waktu Sulawesi Tengah (WITA) agar tanggal kegiatan tidak bergeser. */
const TZ = 'Asia/Makassar'
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })

export const dayKey = (iso: string | Date) => dayFmt.format(typeof iso === 'string' ? new Date(iso) : iso)

export type ActivityItem = { kind: 'kegiatan' | 'berita'; title: string; href: string }
export type ActivityMap = Record<string, ActivityItem[]>

export const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** 0 kosong, 1-4 relatif terhadap hari tersibuk (`max`), agar skala warna terpakai penuh walau datanya sedikit. */
export const levelOf = (n: number, max: number) => (n <= 0 ? 0 : Math.max(1, Math.ceil((n / Math.max(1, max)) * 4)))

/** Minggu Senin-Minggu; sel di luar tahun berisi null. */
export function buildWeeks(year: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, 0, 1))
  const lead = (first.getUTCDay() + 6) % 7 // Senin = 0
  const days: (string | null)[] = Array(lead).fill(null)
  for (let d = new Date(first); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10))
  while (days.length % 7) days.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

export type ActivityStats = {
  total: number
  activeDays: number
  busiest: { date: string; count: number } | null
  longestWeekStreak: number
  topMonth: { month: number; count: number } | null
}

export function summarize(map: ActivityMap, year: number): ActivityStats {
  const unique = new Set<string>()
  let busiest: ActivityStats['busiest'] = null
  const perMonth = Array(12).fill(0) as number[]
  for (const [date, items] of Object.entries(map)) {
    for (const it of items) unique.add(`${it.kind}|${it.href}|${it.title}`)
    if (!busiest || items.length > busiest.count) busiest = { date, count: items.length }
    perMonth[Number(date.slice(5, 7)) - 1] += items.length
  }
  let longest = 0
  let run = 0
  for (const week of buildWeeks(year)) {
    const active = week.some((d) => d && (map[d]?.length ?? 0) > 0)
    run = active ? run + 1 : 0
    longest = Math.max(longest, run)
  }
  const top = perMonth.reduce((best, c, i) => (c > best.count ? { month: i, count: c } : best), { month: -1, count: 0 })
  return {
    total: unique.size,
    activeDays: Object.keys(map).length,
    busiest,
    longestWeekStreak: longest,
    topMonth: top.month >= 0 ? top : null,
  }
}

// ---------- Progres program kerja ----------

export type ProkerStatus = NonNullable<Edition['status']>
export type ProkerItem = {
  id: number
  title: string
  status: ProkerStatus
  start: string | null
  end: string | null
  href: string
}
export type ProkerGroup = { key: string; name: string; items: ProkerItem[] }

