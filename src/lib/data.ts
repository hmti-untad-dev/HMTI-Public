import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { ActiveLoan, PublicItem } from '@/lib/inventory'
import type { Department, Media, Membership, Period, Person } from '@/payload-types'

/** Satu-satunya pintu halaman publik ke Payload (Local API, tanpa HTTP hop). */
export const getClient = cache(() => getPayload({ config }))

export function mediaOf(value: number | Media | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

export const getSiteSettings = cache(async () => {
  const payload = await getClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})

/** Data ringan untuk menu navigasi: departemen dan tahun periode arsip. */
export const getNavData = cache(async () => {
  const payload = await getClient()
  const [{ docs: departments }, { docs: periods }] = await Promise.all([
    payload.find({ collection: 'departments', sort: 'order', limit: 20, depth: 0 }),
    payload.find({ collection: 'periods', sort: '-year', limit: 20, depth: 0 }),
  ])
  return {
    departments: departments.map((d) => ({ name: d.name, slug: d.slug })),
    archivedYears: periods.filter((p) => p.status === 'archived').map((p) => p.year),
  }
})

export const getPeriods = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'periods', sort: '-year', limit: 50, depth: 1 })
  return docs.filter((p) => p.status !== 'draft')
})

export const getActivePeriod = cache(async () => {
  const periods = await getPeriods()
  return periods.find((p) => p.status === 'active') ?? periods[0] ?? null
})

/** Periode dari query ?periode=2026; jatuh ke periode aktif bila kosong / tidak ditemukan. */
export async function resolvePeriod(year?: string | string[]) {
  const periods = await getPeriods()
  const wanted = Array.isArray(year) ? year[0] : year
  const picked = wanted ? periods.find((p) => String(p.year) === wanted) : undefined
  const period = picked ?? periods.find((p) => p.status === 'active') ?? periods[0] ?? null
  return { period, periods }
}

export type CabinetMember = {
  id: number
  person: Person
  position: Membership['position']
  department: Department | null
  photo: Media | null
  /** Foto berupa poster yang sudah memuat nama dan jabatan. */
  poster: boolean
}

/** Kepengurusan satu periode: BPH (tanpa departemen) + anggota per departemen. */
/** Nama departemen pada tahun periode tertentu: nama lama bila tahunnya <= formerNameUntil. */
export function departmentNameAt(d: Pick<Department, 'name' | 'formerName' | 'formerNameUntil'>, year?: number | null) {
  return d.formerName && d.formerNameUntil && year && year <= d.formerNameUntil ? d.formerName : d.name
}

export async function getCabinet(period: Period | null) {
  const empty = { bph: [] as CabinetMember[], pembina: [] as CabinetMember[], pengawas: [] as CabinetMember[], coordinators: [] as CabinetMember[], byDepartment: new Map<number, CabinetMember[]>(), departments: [] as Department[], total: 0 }
  if (!period) return empty

  const payload = await getClient()
  const [{ docs: memberships }, { docs: departments }] = await Promise.all([
    payload.find({ collection: 'memberships', where: { period: { equals: period.id } }, sort: 'order', limit: 500, depth: 2 }),
    payload.find({ collection: 'departments', sort: 'order', limit: 100, depth: 1 }),
  ])

  // Nama departemen mengikuti tahun periode (mis. 2025: Kewirausahaan, bukan Ekonomi Kreatif).
  const named = departments.map((d) => ({ ...d, name: departmentNameAt(d, period.year) }))
  const members: CabinetMember[] = []
  for (const m of memberships) {
    if (typeof m.person !== 'object') continue
    const raw = typeof m.department === 'object' ? m.department : null
    const department = raw ? (named.find((d) => d.id === raw.id) ?? raw) : null
    members.push({
      id: m.id,
      person: m.person,
      position: m.position,
      department,
      photo: mediaOf(m.photoOverride) ?? mediaOf(m.person.photo),
      poster: Boolean(m.photoIsPoster && mediaOf(m.photoOverride)),
    })
  }

  const byDepartment = new Map<number, CabinetMember[]>()
  const bph: CabinetMember[] = []
  const pembina: CabinetMember[] = []
  const pengawas: CabinetMember[] = []
  const coordinators: CabinetMember[] = [] // semua koordinator departemen, dengan atau tanpa departemen terisi
  for (const member of members) {
    if (member.position === 'koordinator') coordinators.push(member)
    if (!member.department) {
      if (member.position === 'pembina') pembina.push(member)
      else if (member.position === 'pengawas') pengawas.push(member)
      else if (member.position !== 'koordinator') bph.push(member)
    } else byDepartment.set(member.department.id, [...(byDepartment.get(member.department.id) ?? []), member])
  }

  // Koordinator diurutkan mengikuti urutan departemen.
  const rank = (m: CabinetMember) => departments.findIndex((d) => d.id === m.department?.id)
  coordinators.sort((a, b) => rank(a) - rank(b))

  return { bph, pembina, pengawas, coordinators, byDepartment, departments: named, total: members.length }
}

export const getPrograms = cache(async (opts: { featured?: boolean } = {}) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'programs',
    where: opts.featured ? { featured: { equals: true } } : undefined,
    sort: 'order',
    limit: 50,
    depth: 1,
  })
  return docs
})

export async function getProgram(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'programs', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  return docs[0] ?? null
}

export async function getEditions(programId: number) {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'editions',
    where: { program: { equals: programId } },
    sort: '-startDate',
    limit: 50,
    depth: 1,
  })
  return docs
}

export const getAchievements = cache(async (opts: { featured?: boolean } = {}) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'achievements',
    where: opts.featured ? { featured: { equals: true } } : undefined,
    sort: '-year',
    limit: 20,
    depth: 1,
  })
  return docs
})

export const getTestimonials = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'testimonials', where: { kind: { not_equals: 'tokoh' } }, sort: 'order', limit: 12, depth: 2 })
  return docs
})

/** Kutipan tokoh (pendiri, Ketua Umum pertama, Kaprodi) untuk bagian Jejak Kepemimpinan. */
export const getQuotes = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'testimonials', where: { kind: { equals: 'tokoh' } }, sort: 'order', limit: 10, depth: 1 })
  return docs
})

export type Chair = { id: number; name: string; year: number; cabinetName: string | null; photo: Media | null; poster: boolean; current: boolean }

/** Semua Ketua Umum dari data keanggotaan (jabatan "ketua" di tiap periode), urut dari periode tertua. */
export const getChairs = cache(async (): Promise<Chair[]> => {
  const payload = await getClient()
  const [{ docs }, active] = await Promise.all([
    payload.find({ collection: 'memberships', where: { position: { equals: 'ketua' } }, limit: 100, depth: 2 }),
    getActivePeriod(),
  ])
  return docs
    .filter((m) => typeof m.person === 'object' && typeof m.period === 'object')
    .map((m) => {
      const person = m.person as Person
      const period = m.period as Period
      const photo = mediaOf(m.photoOverride) ?? mediaOf(person.photo)
      return {
        id: m.id,
        name: person.name,
        year: period.year,
        cabinetName: period.cabinetName ?? null,
        photo,
        poster: Boolean(m.photoIsPoster && mediaOf(m.photoOverride)),
        current: active?.id === period.id,
      }
    })
    .sort((a, b) => a.year - b.year)
})

export async function getArticles(opts: { limit?: number; page?: number } = {}) {
  const payload = await getClient()
  return payload.find({
    collection: 'articles',
    // Local API melewati access control: draft harus disaring manual.
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: opts.limit ?? 12,
    page: opts.page ?? 1,
    depth: 1,
  })
}

export async function getArticle(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'articles', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1 })
  return docs[0] ?? null
}

export async function getAlbums(year?: number) {
  const payload = await getClient()
  return payload.find({
    collection: 'albums',
    where: year ? { year: { equals: year } } : undefined,
    sort: '-year',
    limit: 100,
    depth: 1,
  })
}

/** Foto pilihan "The Best of" untuk carousel polaroid, urut sesuai kolom Urutan di admin. */
export async function getBestPhotos(year?: number) {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'best-photos',
    where: year ? { year: { equals: year } } : undefined,
    sort: ['order', 'createdAt'],
    limit: 100,
    depth: 1,
  })
  return docs
}

export async function getAlbum(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'albums', where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return docs[0] ?? null
}

export const getFaqs = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'faqs', sort: 'order', limit: 50 })
  return docs
})

export const getServices = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'services', sort: 'order', limit: 50, depth: 0 })
  return docs
})

export async function getService(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1 })
  return docs[0] ?? null
}

/** Kutipan tamu yang ditautkan ke edisi kegiatan (halaman edisi dan halaman program). */
export async function getEditionQuotes(editionIds: number[]) {
  if (editionIds.length === 0) return []
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'testimonials', where: { edition: { in: editionIds } }, sort: 'order', limit: 24, depth: 0 })
  return docs
}

/** Mitra, sponsor, dan media partner sebuah edisi, urut sesuai isian. */
export async function getEditionPartners(editionId: number) {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'partners', where: { editions: { in: [editionId] } }, sort: 'order', limit: 200, depth: 1 })
  return docs
}

/**
 * Barang inventaris yang boleh tampil di situs. overrideAccess: false menerapkan aturan akses koleksi, jadi barang
 * internal dan field tempat penyimpanan tidak ikut terbaca, walau dipanggil dari server.
 */
export const getPublicInventory = cache(async (): Promise<PublicItem[]> => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'inventory', where: { visibility: { equals: 'publik' } }, sort: 'name', limit: 500, depth: 0, overrideAccess: false })
  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category ?? null,
    stock: d.stock,
    unit: d.unit ?? null,
    quantityText: d.quantityText ?? null,
    location: d.location ?? null,
    icon: d.icon ?? null,
    loanable: Boolean(d.loanable),
    procurement2025: Boolean(d.procurement2025),
  }))
})

/** Peminjaman dijadwalkan/berjalan yang belum lewat (tanpa data peminjam), untuk menghitung jumlah tersedia. */
export const getActiveLoans = cache(async (): Promise<ActiveLoan[]> => {
  const payload = await getClient()
  const since = new Date(Date.now() - 2 * 86_400_000).toISOString()
  const { docs } = await payload.find({
    collection: 'loans',
    where: { and: [{ status: { in: ['dijadwalkan', 'dipinjam'] } }, { to: { greater_than_equal: since } }] },
    limit: 2000,
    depth: 0,
  })
  return docs.map((l) => ({ item: typeof l.item === 'object' ? l.item.id : l.item, quantity: l.quantity, from: l.from, to: l.to }))
})

export const getPartners = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'partners', sort: 'order', limit: 50, depth: 1 })
  return docs
})

export const getDocuments = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'documents', limit: 50, depth: 1 })
  return docs
})

/** Hasil riset terbit, bisa disaring per departemen penyusun. */
export async function getResearches(opts: { department?: string; limit?: number; page?: number } = {}) {
  const payload = await getClient()
  return payload.find({
    collection: 'researches',
    // Local API melewati access control: draft harus disaring manual.
    where: {
      and: [{ _status: { equals: 'published' } }, ...(opts.department ? [{ 'department.slug': { equals: opts.department } }] : [])],
    },
    sort: '-publishedAt',
    limit: opts.limit ?? 12,
    page: opts.page ?? 1,
    depth: 1,
  })
}

export async function getResearch(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'researches', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1 })
  return docs[0] ?? null
}
