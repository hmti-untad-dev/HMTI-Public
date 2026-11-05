import Link from 'next/link'

import { getAlbums } from '@/lib/data'
import { AlbumCard } from '../cards/AlbumCard'
import { Section } from '../ui/Section'

/** Tinggi berbeda-beda meniru tata letak bertingkat di wireframe. */
const HEIGHTS = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-[2/3]', 'aspect-[3/4]', 'aspect-[4/3]']

/** Foto arsip periode pertama (public/sejarah/), tautannya ke bagian Sejarah di halaman Tentang. */
const ARSIP = [
  { src: '/sejarah/dies-2.webp', alt: 'Foto bersama pada Dies Natalis pertama HMTI UNTAD, 2015', title: 'Dies Natalis pertama · 2015' },
  { src: '/sejarah/baksos-2.webp', alt: 'Bakti sosial HMTI UNTAD bersama adik-adik Panti Asuhan As-Salam', title: 'Bakti sosial · 2015' },
]

export async function GalleryPreview() {
  const { docs } = await getAlbums()
  const albums = docs.slice(0, 3)
  return (
    <Section tone="alt" eyebrow="Dokumentasi" title="Galeri" action={{ href: '/galeri', label: 'Lihat galeri' }}>
      <ul className="grid grid-cols-2 items-end gap-4 md:grid-cols-5">
        {albums.map((album, i) => (
          <li key={album.id}>
            <AlbumCard album={album} className={HEIGHTS[i % HEIGHTS.length]} />
          </li>
        ))}
        {ARSIP.map((a, i) => (
          <li key={a.src}>
            <Link href="/tentang#sejarah" className="group block" data-tilt>
              <div className="cv-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.src} alt={a.alt} loading="lazy" decoding="async" className={`skeleton w-full object-cover ${HEIGHTS[(albums.length + i) % HEIGHTS.length]}`} />
              </div>
              <p className="mt-2 text-sm font-medium group-hover:text-link">{a.title}</p>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted">Arsip sejarah</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
