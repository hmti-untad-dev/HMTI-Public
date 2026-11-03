import { getAlbums } from '@/lib/data'
import { AlbumCard } from '../cards/AlbumCard'
import { Empty } from '../ui/Empty'
import { Section } from '../ui/Section'

/** Tinggi berbeda-beda meniru tata letak bertingkat di wireframe. */
const HEIGHTS = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-[2/3]']

export async function GalleryPreview() {
  const { docs } = await getAlbums()
  return (
    <Section tone="alt" eyebrow="Dokumentasi" title="Galeri" action={{ href: '/galeri', label: 'Lihat galeri' }}>
      {docs.length === 0 ? (
        <Empty>Belum ada album.</Empty>
      ) : (
        <ul className="grid grid-cols-3 items-end gap-4">
          {docs.slice(0, 3).map((album, i) => (
            <li key={album.id}>
              <AlbumCard album={album} className={HEIGHTS[i % HEIGHTS.length]} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
