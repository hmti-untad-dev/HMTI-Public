import type { Department, Program } from '@/payload-types'
import { type ActivityItem, type ActivityMap, type ProkerGroup, addDays, dayKey } from './activity-core'
import { getClient } from './data'

/** Aktivitas per hari dalam satu tahun: edisi kegiatan (termasuk rentang hari) dan berita terbit. */
export async function getActivity(year: number): Promise<ActivityMap> {
  const payload = await getClient()
  const from = `${year}-01-01T00:00:00+08:00`
  const to = `${year}-12-31T23:59:59+08:00`
  const [editions, articles] = await Promise.all([
    payload.find({ collection: 'editions', where: { startDate: { greater_than_equal: from, less_than_equal: to } }, limit: 500, depth: 1, pagination: false }),
    payload.find({
      collection: 'articles',
      // Local API melewati access control: draft harus disaring manual.
      where: { and: [{ _status: { equals: 'published' } }, { publishedAt: { greater_than_equal: from, less_than_equal: to } }] },
      limit: 500,
      depth: 0,
      pagination: false,
    }),
  ])

  const map: ActivityMap = {}
  const push = (key: string, item: ActivityItem) => {
    if (!key.startsWith(`${year}-`)) return
    ;(map[key] ??= []).push(item)
  }

  for (const e of editions.docs) {
    if (!e.startDate) continue
    const program = typeof e.program === 'object' ? e.program : null
    const item: ActivityItem = { kind: 'kegiatan', title: e.title, href: program ? `/kegiatan/${program.slug}/${year}` : '/kegiatan' }
    const start = dayKey(e.startDate)
    const end = e.endDate ? dayKey(e.endDate) : start
    // Rentang maksimal 14 hari agar data salah ketik tidak mengisi setahun penuh.
    for (let i = 0; i <= 14; i++) {
      const k = addDays(start, i)
      if (k > end) break
      push(k, item)
    }
  }
  for (const a of articles.docs) {
    if (a.publishedAt) push(dayKey(a.publishedAt), { kind: 'berita', title: a.title, href: `/berita/${a.slug}` })
  }
  return map
}

/** Edisi kegiatan satu periode dikelompokkan per departemen penyelenggara (urutan departemen dari CMS). */
export async function getProkerProgress(periodId: number): Promise<ProkerGroup[]> {
  const payload = await getClient()
  const [{ docs: editions }, { docs: departments }] = await Promise.all([
    payload.find({ collection: 'editions', where: { period: { equals: periodId } }, sort: 'startDate', limit: 300, depth: 2, pagination: false }),
    payload.find({ collection: 'departments', sort: 'order', limit: 50, depth: 0 }),
  ])

  const groups = new Map<string, ProkerGroup>(departments.map((d: Department) => [String(d.id), { key: d.slug, name: d.name, items: [] }]))
  const other: ProkerGroup = { key: 'lainnya', name: 'Lainnya', items: [] }

  for (const e of editions) {
    const program = typeof e.program === 'object' ? (e.program as Program) : null
    const dept = program && typeof program.department === 'object' ? program.department : null
    const target = dept ? groups.get(String(dept.id)) : undefined
    const year = e.startDate ? new Date(e.startDate).getFullYear() : null
    ;(target ?? other).items.push({
      id: e.id,
      title: e.title,
      status: e.status ?? 'rencana',
      start: e.startDate ? dayKey(e.startDate) : null,
      end: e.endDate ? dayKey(e.endDate) : e.startDate ? dayKey(e.startDate) : null,
      href: program && year ? `/kegiatan/${program.slug}/${year}` : '/kegiatan',
    })
  }
  return [...groups.values(), other].filter((g) => g.items.length > 0)
}
