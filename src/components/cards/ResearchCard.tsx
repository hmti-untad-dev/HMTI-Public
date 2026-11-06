import Link from '@/components/ui/AppLink'

import { mediaOf } from '@/lib/data'
import { formatDate } from '@/lib/format'
import type { Research } from '@/payload-types'
import { Img } from '../ui/Img'

export const KIND_LABEL: Record<Research['kind'], string> = { riset: 'Hasil riset', temuan: 'Temuan', artikel: 'Artikel' }

export function ResearchCard({ item }: { item: Research }) {
  const dept = typeof item.department === 'object' ? item.department : null
  return (
    <Link href={`/riset/${item.slug}`} className="group block" data-tilt>
      <div className="cv-frame">
        <Img media={mediaOf(item.cover)} label={item.title} placeholder={KIND_LABEL[item.kind] ?? 'Riset'} className="aspect-video w-full" />
      </div>
      <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-wider text-ink-muted">
        {[KIND_LABEL[item.kind], dept?.name, item.publishedAt && formatDate(item.publishedAt)].filter(Boolean).join(' · ')}
      </p>
      <h3 className="font-display text-lg font-semibold group-hover:text-link">{item.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm text-ink-muted">{item.summary}</p>
    </Link>
  )
}
