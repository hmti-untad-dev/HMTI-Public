import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/format'
import { getEditions, getProgram, mediaOf } from '@/lib/data'

export async function generateMetadata({ params }: { params: Promise<{ program: string }> }) {
  const program = await getProgram((await params).program)
  return { title: program?.name ?? 'Program kerja', description: program?.summary ?? undefined }
}

export default async function ProgramPage({ params }: { params: Promise<{ program: string }> }) {
  const { program: slug } = await params
  const program = await getProgram(slug)
  if (!program) notFound()

  const editions = await getEditions(program.id)
  const department = typeof program.department === 'object' ? program.department : null
  const paragraphs = (program.about ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const loc = program.location
  const hasMap = typeof loc?.lat === 'number' && typeof loc?.lng === 'number'
  const gallery = (program.gallery ?? []).filter((g) => mediaOf(g.image))
  const products = program.products ?? []

  return (
    <>
      <PageHeader eyebrow={department?.name ?? 'Program kerja'} title={program.name}>
        {program.summary}
      </PageHeader>

      {(paragraphs.length > 0 || loc?.name) && (
        <Container className="grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-w-2xl space-y-4 text-lg text-ink-muted">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          {loc?.name && (
            <aside aria-label={`Lokasi: ${loc.name}`} className="self-start">
              <h2 className="font-display text-xl font-bold">{loc.name}</h2>
              {loc.area && <p className="mt-1 text-ink-muted">{loc.area}</p>}
              {hasMap && (
                <iframe
                  title={`Peta ${loc.name}`}
                  src={`https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=13&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="mt-4 aspect-[4/3] w-full border border-line bg-surface-alt"
                />
              )}
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {loc.mapUrl && (
                  <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                    Buka di Google Maps ↗
                  </a>
                )}
                {loc.website && (
                  <a href={loc.website} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                    Situs desa ↗
                  </a>
                )}
              </p>
            </aside>
          )}
        </Container>
      )}

      {gallery.length > 0 && (
        <section aria-labelledby="galeri-program" className="border-t border-line bg-surface-alt py-12">
          <Container>
            <h2 id="galeri-program" className="mb-6 font-display text-2xl font-bold">
              Galeri kegiatan
            </h2>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g, i) => (
                <li key={g.id ?? i} className={i === 0 ? 'col-span-2 md:col-span-2 md:row-span-2' : ''}>
                  <figure className="h-full">
                    <div className={`cv-frame ${i === 0 ? 'md:h-full' : ''}`}>
                      <Img media={mediaOf(g.image)} label={g.caption ?? undefined} className={`w-full ${i === 0 ? 'aspect-video md:h-full md:min-h-72' : 'aspect-[4/3]'}`} />
                    </div>
                    {g.caption && <figcaption className="mt-1.5 text-xs text-ink-muted">{g.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {products.length > 0 && program.productsTitle && (
        <section aria-labelledby="produk-program" className="py-12">
          <Container>
            <h2 id="produk-program" className="font-display text-2xl font-bold">
              {program.productsTitle}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-3">
              {products.map((p, i) => (
                <li key={p.id ?? i}>
                  <Img media={mediaOf(p.image)} label="Foto produk" className="aspect-square w-full" />
                  <p className="mt-3 font-display font-semibold">{p.name}</p>
                  {p.note && <p className="text-sm text-ink-muted">{p.note}</p>}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <Container className="border-t border-line py-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Edisi</h2>
        {editions.length === 0 ? (
          <Empty>Belum ada edisi.</Empty>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {editions.map((e) => {
              const year = e.startDate ? new Date(e.startDate).getFullYear() : typeof e.period === 'object' ? e.period.year : null
              return (
                <li key={e.id}>
                  <Link href={`/kegiatan/${program.slug}/${year ?? e.id}`} className="lift block rounded-card border border-line p-4 hover:border-brand">
                    <p className="font-display font-semibold">{e.title}</p>
                    <p className="text-sm text-ink-muted">{[formatDate(e.startDate), e.location].filter(Boolean).join(' · ')}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Container>
    </>
  )
}
