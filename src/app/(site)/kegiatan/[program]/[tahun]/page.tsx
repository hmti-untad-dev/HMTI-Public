import { notFound } from 'next/navigation'
import Link from '@/components/ui/AppLink'

import { EditionQuotes } from '@/components/sections/EditionQuotes'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { formatDateRange, pad } from '@/lib/format'
import { getEditionPartners, getEditionQuotes, getEditions, getProgram, mediaOf } from '@/lib/data'
import type { Edition, Partner } from '@/payload-types'

type Props = { params: Promise<{ program: string; tahun: string }> }

const STATUS: Record<Edition['status'], string> = { rencana: 'Rencana', berjalan: 'Berjalan', selesai: 'Selesai', ditunda: 'Ditunda' }
const ROLES: { value: NonNullable<Partner['role']>; label: string }[] = [
  { value: 'kolaborator', label: 'Kolaborator' },
  { value: 'sponsor-utama', label: 'Sponsor utama' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'media', label: 'Media partner' },
]

async function findEdition({ params }: Props) {
  const { program: slug, tahun } = await params
  const program = await getProgram(slug)
  if (!program) return null
  const editions = await getEditions(program.id)
  const edition = editions.find((e) => {
    const year = e.startDate ? new Date(e.startDate).getFullYear() : typeof e.period === 'object' ? e.period.year : null
    return String(year ?? e.id) === tahun
  })
  return edition ? { program, edition } : null
}

export async function generateMetadata(props: Props) {
  const found = await findEdition(props)
  if (!found) return {}
  return { title: found.edition.title, description: found.edition.theme ?? found.program.summary ?? undefined }
}

/** Group berurutan sesuai kemunculan pertama, mis. pemenang per lomba. */
function groupBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T[]>()
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item])
  return [...map.entries()]
}

export default async function EditionPage(props: Props) {
  const found = await findEdition(props)
  if (!found) notFound()
  const { program, edition } = found

  const [quotes, partners] = await Promise.all([getEditionQuotes([edition.id]), getEditionPartners(edition.id)])
  const album = typeof edition.album === 'object' ? edition.album : null
  const cover = mediaOf(edition.cover)
  const stats = edition.stats ?? []
  const timeline = edition.timeline ?? []
  const winners = groupBy(edition.winners ?? [], (w) => w.competition)
  const coverage = edition.coverage ?? []
  const partnerGroups = ROLES.map((r) => ({ ...r, items: partners.filter((p) => p.role === r.value) })).filter((g) => g.items.length > 0)
  const date = formatDateRange(edition.startDate, edition.endDate)

  return (
    <>
      <PageHeader eyebrow={program.name} title={edition.title}>
        {edition.theme && <p className="text-lg text-ink">“{edition.theme}”</p>}
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em]">
          {[date, edition.location, STATUS[edition.status]].filter(Boolean).join(' · ')}
        </p>
      </PageHeader>

      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="max-w-2xl space-y-6">
            {cover && <Img media={cover} label={edition.title} className="aspect-video w-full" />}
            {edition.description && <RichText data={edition.description} />}
          </div>
          <aside className="self-start border border-line">
            <dl className="divide-y divide-line text-sm">
              {date && (
                <div className="grid grid-cols-[6rem_1fr] gap-3 p-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-ink-muted">Waktu</dt>
                  <dd>{date}</dd>
                </div>
              )}
              {edition.location && (
                <div className="grid grid-cols-[6rem_1fr] gap-3 p-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-ink-muted">Tempat</dt>
                  <dd>{edition.location}</dd>
                </div>
              )}
              <div className="grid grid-cols-[6rem_1fr] gap-3 p-4">
                <dt className="font-mono text-xs uppercase tracking-widest text-ink-muted">Status</dt>
                <dd>{STATUS[edition.status]}</dd>
              </div>
            </dl>
            {(program.website || edition.registrationUrl || album) && (
              <div className="flex flex-wrap gap-3 border-t border-line p-4">
                {edition.registrationUrl && <Button href={edition.registrationUrl}>Daftar</Button>}
                {program.website && (
                  <a href={program.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-link hover:underline">
                    Situs resmi {program.shortName || program.name} ↗
                  </a>
                )}
                {album && (
                  <Link href={`/galeri/${album.slug}`} className="text-sm font-medium text-link hover:underline">
                    Lihat album foto →
                  </Link>
                )}
              </div>
            )}
          </aside>
        </div>

        {stats.length > 0 && (
          <section aria-labelledby="capaian" className="mt-12 border-t border-line pt-12">
            <h2 id="capaian" className="font-display text-2xl font-bold">
              Capaian dalam angka
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((s, i) => (
                <li key={s.id ?? i} className="bg-surface p-6">
                  <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-link">{s.value}</p>
                  <p className="mt-2 text-sm text-ink-muted">{s.label}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {timeline.length > 0 && (
          <section aria-labelledby="rangkaian" className="mt-12 border-t border-line pt-12">
            <h2 id="rangkaian" className="font-display text-2xl font-bold">
              Rangkaian kegiatan
            </h2>
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {timeline.map((t, i) => (
                <li key={t.id ?? i} className="grid gap-2 py-5 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6">
                  <span className="font-mono text-sm text-link">{pad(i + 1)}</span>
                  <div>
                    <h3 className="font-display font-semibold">{t.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-ink-muted">{[t.date, t.place].filter(Boolean).join(' · ')}</p>
                  </div>
                  {t.detail && <p className="text-ink-muted">{t.detail}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        <EditionQuotes quotes={quotes} />

        {winners.length > 0 && (
          <section aria-labelledby="pemenang" className="border-t border-line py-12">
            <h2 id="pemenang" className="font-display text-2xl font-bold">
              Pemenang lomba
            </h2>
            <div className="mt-6 grid gap-8 lg:grid-cols-3">
              {winners.map(([competition, list]) => (
                <div key={competition}>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-link">{competition}</h3>
                  <ol className="mt-3 space-y-4">
                    {list.map((w, i) => (
                      <li key={w.id ?? i} className="border-l-2 border-line pl-4">
                        <p className="font-mono text-xs text-ink-muted">{w.rank}</p>
                        {w.work && <p className="mt-0.5 font-medium">{w.work}</p>}
                        {w.entrant && <p className="text-sm text-ink-muted">{w.entrant}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        )}

        {partnerGroups.length > 0 && (
          <section aria-labelledby="mitra" className="border-t border-line py-12">
            <h2 id="mitra" className="font-display text-2xl font-bold">
              Mitra dan pendukung
            </h2>
            <div className="mt-6 space-y-6">
              {partnerGroups.map((g) => (
                <div key={g.value} className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                  <h3 className="pt-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{g.label}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {g.items.map((p) => (
                      <li key={p.id}>
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-block border border-line px-3 py-1.5 text-sm hover:border-brand">
                            {p.name}
                          </a>
                        ) : (
                          <span className="inline-block border border-line px-3 py-1.5 text-sm">{p.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {coverage.length > 0 && (
          <section aria-labelledby="liputan" className="border-t border-line pt-12">
            <h2 id="liputan" className="font-display text-2xl font-bold">
              Liputan media
            </h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {coverage.map((c, i) => (
                <li key={c.id ?? i}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="group grid gap-1 py-4 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-6">
                    <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">{c.outlet}</span>
                    <span className="font-medium group-hover:text-link group-hover:underline">{c.title}</span>
                    <span aria-hidden="true" className="hidden text-ink-muted sm:inline">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  )
}
