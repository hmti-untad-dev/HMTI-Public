import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { formatDate } from '@/lib/format'
import { getArticle, mediaOf } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  return article ? { title: article.title, description: article.excerpt ?? undefined } : {}
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const gallery = (article.gallery ?? []).filter((g) => mediaOf(g.image))

  return (
    <>
      <PageHeader eyebrow={article.category ?? 'Berita'} title={article.title}>
        {[formatDate(article.publishedAt), article.author].filter(Boolean).join(' · ')}
      </PageHeader>
      <Container className="max-w-3xl space-y-8 py-12">
        <Img media={mediaOf(article.cover)} label={article.title} className="aspect-video w-full" />
        <RichText data={article.content} />
        {gallery.length > 0 && (
          <div className="grid gap-4">
            {gallery.map((g, i) => (
              <figure key={g.id ?? i}>
                <Img media={mediaOf(g.image)} label={g.caption ?? article.title} className="aspect-video w-full" />
                {g.caption && <figcaption className="mt-1.5 text-sm text-ink-muted">{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
        {article.sourceUrl && (
          <p className="border-t border-line pt-4 text-sm text-ink-muted">
            Disadur dari{' '}
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
              {article.sourceName || new URL(article.sourceUrl).hostname} ↗
            </a>
          </p>
        )}
      </Container>
    </>
  )
}
