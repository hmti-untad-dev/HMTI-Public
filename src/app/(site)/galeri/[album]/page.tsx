import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { getAlbum, mediaOf } from '@/lib/data'

export default async function AlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const { album: slug } = await params
  const album = await getAlbum(slug)
  if (!album) notFound()

  const photos = album.photos ?? []
  return (
    <>
      <PageHeader eyebrow={`Galeri ${album.year}`} title={album.title} />
      <Container className="py-12">
        {photos.length === 0 ? (
          <Empty>Album ini belum berisi foto.</Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <li key={p.id}>
                <Img media={mediaOf(p.image)} label={p.caption ?? album.title} className="aspect-square w-full rounded-card" />
                {p.caption && <p className="mt-1 text-xs text-ink-muted">{p.caption}</p>}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}
