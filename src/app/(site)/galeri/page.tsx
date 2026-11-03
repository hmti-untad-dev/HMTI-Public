import type { Metadata } from 'next'

import { AlbumCard } from '@/components/cards/AlbumCard'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { YearSelector } from '@/components/ui/YearSelector'
import { getAlbums } from '@/lib/data'

export const metadata: Metadata = { title: 'Galeri' }

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ tahun?: string }> }) {
  const { tahun } = await searchParams
  const all = await getAlbums()
  const years = [...new Set(all.docs.map((a) => a.year))].sort((a, b) => b - a)
  const year = years.includes(Number(tahun)) ? Number(tahun) : years[0]
  const albums = all.docs.filter((a) => a.year === year)
  const best = albums.filter((a) => a.bestOfYear)

  return (
    <>
      <PageHeader eyebrow="Dokumentasi" title="Galeri" />
      <Container className="space-y-12 py-12">
        <YearSelector years={years} current={year} hrefFor={(y) => `/galeri?tahun=${y}`} label="Tahun" />

        {albums.length === 0 ? (
          <Empty>Belum ada album.</Empty>
        ) : (
          <>
            {best.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl font-bold">The Best of {year}</h2>
                <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {best.map((a) => (
                    <li key={a.id}>
                      <AlbumCard album={a} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Semua album {year}</h2>
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {albums.map((a) => (
                  <li key={a.id}>
                    <AlbumCard album={a} className="aspect-square" />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </Container>
    </>
  )
}
