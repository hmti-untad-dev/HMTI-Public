import type { Edition } from '@/payload-types'

/** Hari dihitung menurut waktu Sulawesi Tengah (WITA) agar tanggal kegiatan tidak bergeser. */
const TZ = 'Asia/Makassar'
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })

export const dayKey = (iso: string | Date) => dayFmt.format(typeof iso === 'string' ? new Date(iso) : iso)

/** Sesi dalam sehari. Heatmap menghitung berapa sesi yang terisi, jadi skalanya selalu 0 sampai 4. */
export const DAYPARTS = [
  { key: 'pagi', label: 'Pagi', range: '04.00–10.59' },
  { key: 'siang', label: 'Siang', range: '11.00–14.59' },
  { key: 'sore', label: 'Sore', range: '15.00–17.59' },
  { key: 'malam', label: 'Malam', range: '18.00–03.59' },
] as const
export type Daypart = (typeof DAYPARTS)[number]['key']

const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' })
export function daypartOf(iso: string | Date): Daypart {
  const h = Number(hourFmt.format(typeof iso === 'string' ? new Date(iso) : iso))
  return h >= 4 && h < 11 ? 'pagi' : h >= 11 && h < 15 ? 'siang' : h >= 15 && h < 18 ? 'sore' : 'malam'
}

/** `slots` kosong = sesi belum diisi admin; tetap dihitung sebagai satu sesi. */
export type ActivityItem = { kind: 'kegiatan' | 'berita'; title: string; href: string; slots: Daypart[] }
export type ActivityMap = Record<string, ActivityItem[]>

export type Landmark = { title: string; description: string | null; href: string | null; upcoming: boolean }
export type LandmarkMap = Record<string, Landmark[]>

/** Sesi yang terisi pada satu hari. */
export const slotsOf = (items: ActivityItem[]): Set<Daypart> => new Set(items.flatMap((i) => i.slots))

/** 0 = kosong; 1 sampai 4 = jumlah sesi (pagi, siang, sore, malam) yang terisi. Ada aktivitas tanpa sesi = 1. */
export const dayLevel = (items: ActivityItem[]) => (items.length === 0 ? 0 : Math.min(4, Math.max(1, slotsOf(items).size)))

export const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

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

