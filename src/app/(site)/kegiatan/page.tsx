import type { Metadata } from 'next'
import Link from 'next/link'

import { ProgramCard } from '@/components/cards/ProgramCard'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { getPrograms, mediaOf } from '@/lib/data'

export const metadata: Metadata = { title: 'Kegiatan' }

export default async function ActivitiesPage() {
  const programs = await getPrograms()
  const featured = programs.filter((p) => p.featured)
  const others = programs.filter((p) => !p.featured)

  return (
    <>
      <PageHeader eyebrow="Program kerja" title="Kegiatan">
        Seluruh program kerja himpunan beserta edisi tiap tahunnya.
      </PageHeader>
      <Container className="space-y-12 py-12">
        {programs.length === 0 && <Empty>Belum ada kegiatan.</Empty>}

        {featured.length > 0 && (
          <ul className="grid gap-6 md:grid-cols-2">
            {featured.map((p) => (
              <li key={p.id}>
                <Link href={`/kegiatan/${p.slug}`} className="group relative block overflow-hidden rounded-card">
                  <Img media={mediaOf(p.cover)} label={p.name} className="aspect-video w-full" />
                  <div className="absolute inset-x-0 bottom-0 bg-scrim/85 p-4 text-white">
                    <p className="font-display text-xl font-semibold">{p.name}</p>
                    {p.summary && <p className="line-clamp-2 text-sm text-white/80">{p.summary}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {others.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold">Lainnya</h2>
            <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {others.map((p) => (
                <li key={p.id}>
                  <ProgramCard program={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  )
}
