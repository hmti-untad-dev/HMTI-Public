import Link from 'next/link'

import { mediaOf } from '@/lib/data'
import { formatDate } from '@/lib/format'
import type { Article } from '@/payload-types'
import { Img } from '../ui/Img'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/berita/${article.slug}`} className="group block">
      <Img media={mediaOf(article.cover)} label={article.title} className="aspect-video w-full rounded-card" />
      <p className="mt-3 text-xs uppercase tracking-wider text-ink-muted">
        {article.category} {article.publishedAt && `· ${formatDate(article.publishedAt)}`}
      </p>
      <h3 className="font-display text-lg font-semibold group-hover:text-brand">{article.title}</h3>
      {article.excerpt && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{article.excerpt}</p>}
    </Link>
  )
}
