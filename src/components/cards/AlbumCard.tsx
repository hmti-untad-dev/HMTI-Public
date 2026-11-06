import Link from '@/components/ui/AppLink'

import { mediaOf } from '@/lib/data'
import type { Album } from '@/payload-types'
import { Img } from '../ui/Img'

export function AlbumCard({ album, className = 'aspect-[3/4]' }: { album: Album; className?: string }) {
  return (
    <Link href={`/galeri/${album.slug}`} className="group block" data-tilt>
      <div className="cv-frame">
        <Img media={mediaOf(album.cover)} label={album.title} placeholder={`Album ${album.year}`} className={`${className} w-full`} />
      </div>
      <p className="mt-2 text-sm font-medium group-hover:text-link">{album.title}</p>
    </Link>
  )
}
