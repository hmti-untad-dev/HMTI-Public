import type { CollectionSlug, Payload } from 'payload'

import { ADMIN_HELP } from '@/content/admin-help'

type Label = string | Record<string, string>
type Entity = { label: Label; slug: string; type: 'collections' | 'globals' }
type NavGroup = { label: string; entities: Entity[] }
type Permissions = { collections?: Record<string, { read?: boolean }>; globals?: Record<string, { read?: boolean }> }
type Props = { payload: Payload; user?: { name?: string | null; email?: string } | null; permissions?: Permissions }

/** Urutan bagian di peta admin: yang paling sering dipakai lebih dulu, Sistem terakhir. */
const GROUP_ORDER = ['Konten', 'Kegiatan', 'Layanan', 'Kepengurusan', 'Sistem']
const rank = (label: string) => (GROUP_ORDER.includes(label) ? GROUP_ORDER.indexOf(label) : GROUP_ORDER.length)
/** Kelompokkan koleksi dan global yang boleh dibaca user ini menurut admin.group, sesuai urutan di config. */
function groupsFor(payload: Payload, permissions: Permissions = {}): NavGroup[] {
  const map = new Map<string, Entity[]>()
  const add = (group: unknown, e: Entity) => {
    const label = typeof group === 'string' ? group : 'Lainnya'
    map.set(label, [...(map.get(label) ?? []), e])
  }
  for (const c of payload.config.collections) {
    if (c.admin?.hidden === true || !permissions.collections?.[c.slug]?.read) continue
    add(c.admin?.group, { label: (c.labels?.plural as Label) ?? c.slug, slug: c.slug, type: 'collections' })
  }
  for (const g of payload.config.globals) {
    if (g.admin?.hidden === true || !permissions.globals?.[g.slug]?.read) continue
    add(g.admin?.group, { label: (g.label as Label) ?? g.slug, slug: g.slug, type: 'globals' })
  }
  return [...map].map(([label, entities]) => ({ label, entities })).sort((a, b) => rank(a.label) - rank(b.label))
}

const labelOf = (l: Label) => (typeof l === 'string' ? l : (l.id ?? l.en ?? Object.values(l)[0] ?? ''))

type Todo = { label: string; count: number; href: string; hint: string }

/** Nomor hari WITA untuk membandingkan tanggal peminjaman dengan hari ini. */
const todayIso = () => new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10)

async function count(payload: Payload, collection: 'service-requests' | 'chat-messages' | 'loans', where: Record<string, unknown>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await payload.count({ collection, where: where as any, overrideAccess: true })).totalDocs
  } catch {
    return 0
  }
}

const q = (o: Record<string, string>) => '?' + new URLSearchParams(o).toString()

/**
 * Sambutan di atas dashboard admin: hal yang perlu ditindaklanjuti hari ini (permintaan baru, pesan belum dibalas,
 * peminjaman yang jatuh tempo) dan pintasan kerja yang paling sering dipakai.
 */
export async function AdminWelcome({ payload, user, permissions }: Props) {
  const today = todayIso()
  const [requests, messages, pickup, overdue] = await Promise.all([
    count(payload, 'service-requests', { status: { equals: 'baru' } }),
    count(payload, 'chat-messages', { status: { equals: 'baru' } }),
    count(payload, 'loans', { and: [{ status: { equals: 'dijadwalkan' } }, { from: { less_than_equal: `${today}T23:59:59.999+08:00` } }] }),
    count(payload, 'loans', { and: [{ status: { equals: 'dipinjam' } }, { to: { less_than: `${today}T00:00:00.000+08:00` } }] }),
  ])

  const todos: Todo[] = [
    { label: 'Permintaan layanan baru', count: requests, href: `/admin/collections/service-requests${q({ 'where[status][equals]': 'baru' })}`, hint: 'Periksa surat, lalu ubah status ke Diproses.' },
    { label: 'Pesan belum dibalas', count: messages, href: `/admin/collections/chat-messages${q({ 'where[status][equals]': 'baru' })}`, hint: 'Dari form Kontak, chat FAQ, dan layanan Bisnis.' },
    { label: 'Barang siap diambil', count: pickup, href: `/admin/collections/loans${q({ 'where[status][equals]': 'dijadwalkan' })}`, hint: 'Ubah ke Dipinjam saat barang diserahkan.' },
    { label: 'Peminjaman lewat tenggat', count: overdue, href: `/admin/collections/loans${q({ 'where[status][equals]': 'dipinjam' })}`, hint: 'Hubungi peminjam atau tandai Dikembalikan.' },
  ]
  const pending = todos.filter((t) => t.count > 0)

  // Peta admin: semua bagian yang boleh dibuka user ini, lengkap dengan fungsinya dan jumlah isinya.
  const groups = groupsFor(payload, permissions)
  const counts = new Map<string, number>()
  await Promise.all(
    groups.flatMap((g) =>
      g.entities
        .filter((e) => e.type === 'collections')
        .map(async (e) => {
          try {
            counts.set(e.slug, (await payload.count({ collection: e.slug as CollectionSlug, overrideAccess: true })).totalDocs)
          } catch {
            /* koleksi tanpa hitungan: kartu tetap tampil tanpa angka */
          }
        }),
    ),
  )
  const name = user?.name?.trim() || user?.email?.split('@')[0] || 'pengurus'

  return (
    <section className="hm-welcome" aria-label="Ringkasan admin">
      <div className="hm-welcome__head">
        <div>
          <p className="hm-eyebrow">Ruang pengurus · HMTI UNTAD</p>
          <h1 className="hm-welcome__title">Halo, {name}.</h1>
          <p className="hm-welcome__lead">
            Semua yang tampil di situs diatur dari sini. Setiap daftar punya tombol <span className="hm-kbd">?</span> yang menjelaskan fungsi dan alurnya.
          </p>
        </div>
        <a className="hm-btn hm-btn--ghost" href="/" target="_blank" rel="noreferrer">
          Buka situs <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="hm-welcome__grid">
        <div className="hm-panel">
          <h2 className="hm-eyebrow">Perlu ditindaklanjuti</h2>
          {pending.length === 0 ? (
            <p className="hm-empty">Tidak ada yang menunggu. Permintaan dan pesan baru akan muncul di sini.</p>
          ) : (
            <ul className="hm-todos">
              {pending.map((t) => (
                <li key={t.label}>
                  <a href={t.href}>
                    <span className="hm-todo__n">{t.count}</span>
                    <span>
                      <span className="hm-todo__label">{t.label}</span>
                      <span className="hm-todo__hint">{t.hint}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hm-panel">
          <h2 className="hm-eyebrow">Pintasan</h2>
          <ul className="hm-shortcuts">
            <li><a href="/admin/collections/articles/create">Tulis berita</a></li>
            <li><a href="/admin/collections/albums">Tambah foto dokumentasi</a></li>
            <li><a href="/admin/collections/editions">Perbarui edisi kegiatan</a></li>
            <li><a href="/admin/collections/inventory">Kelola inventaris</a></li>
            <li><a href="/admin/globals/site-settings">Pengaturan situs dan kursor</a></li>
          </ul>
        </div>
      </div>

      <div className="hm-map">
        {groups.map((g) => (
          <section key={g.label} className="hm-map__group" aria-label={g.label}>
            <h2 className="hm-map__label">{g.label}</h2>
            <ul className="hm-map__grid">
              {g.entities.map((e) => {
                const href = `/admin/${e.type}/${e.slug}`
                const n = counts.get(e.slug)
                return (
                  <li key={e.slug} className="hm-map__card">
                    <a href={href} className="hm-map__link">
                      <span className="hm-map__title">{labelOf(e.label)}</span>
                      {ADMIN_HELP[e.slug] && <span className="hm-map__desc">{ADMIN_HELP[e.slug].summary}</span>}
                    </a>
                    <span className="hm-map__foot">
                      <span className="hm-map__count">{e.type === 'collections' ? `${n ?? '–'} entri` : 'Pengaturan'}</span>
                      {e.type === 'collections' && (
                        <a href={`${href}/create`} className="hm-map__new" aria-label={`Tambah ${labelOf(e.label)}`}>
                          + Baru
                        </a>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}
