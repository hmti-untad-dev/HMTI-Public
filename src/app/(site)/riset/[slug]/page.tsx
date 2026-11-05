import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { KIND_LABEL } from '@/components/cards/ResearchCard'
import { Container } from '@/components/ui/Container'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { getResearch, mediaOf } from '@/lib/data'
import { formatDate } from '@/lib/format'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getResearch(slug)
  return item ? { title: item.title, description: item.summary } : {}
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getResearch(slug)
  if (!item) notFound()

  const dept = typeof item.department === 'object' ? item.department : null
  const file = mediaOf(item.file)
  const tags = item.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? []

  return (
    <>
      <PageHeader eyebrow={[KIND_LABEL[item.kind], dept?.name].filter(Boolean).join(' · ')} title={item.title}>
        {[formatDate(item.publishedAt), item.authors].filter(Boolean).join(' · ')}
      </PageHeader>
      <Container className="max-w-3xl space-y-8 py-12">
        {item.cover && <Img media={mediaOf(item.cover)} label={item.title} className="aspect-video w-full" />}
        <p className="text-lg text-ink">{item.summary}</p>
        {item.content && <RichText data={item.content} />}

        {(file?.url || item.externalUrl) && (
          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            {file?.url && (
              <a href={file.url} download className="inline-flex min-h-11 items-center bg-brand px-5 text-sm font-medium text-on-brand hover:bg-brand-strong">
                Unduh berkas lengkap
              </a>
            )}
            {item.externalUrl && (
              <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border border-brand px-5 text-sm font-medium text-link hover:bg-brand-soft/50">
                Buka tautan sumber
              </a>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Kata kunci">
            {tags.map((t) => (
              <li key={t} className="border border-line px-2.5 py-1 font-mono text-xs text-ink-muted">
                {t}
              </li>
            ))}
          </ul>
        )}
        <Link href="/riset" className="inline-block text-sm text-link hover:underline">
          ← Semua hasil riset
        </Link>
      </Container>
    </>
  )
}
