import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { getArticles } from '@/lib/data'

export const metadata: Metadata = { title: 'Berita' }

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const result = await getArticles({ limit: 9, page: current })
  const [lead, ...rest] = result.docs

  return (
    <>
      <PageHeader eyebrow="Kabar terbaru" title="Berita" />
      <Container className="space-y-10 py-12">
        {!lead ? (
          <Empty>Belum ada berita.</Empty>
        ) : (
          <>
            <div className="max-w-3xl">
              <ArticleCard article={lead} />
            </div>
            {rest.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <li key={a.id}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {result.totalPages > 1 && (
          <nav aria-label="Halaman berita" className="flex items-center justify-between text-sm">
            {result.hasPrevPage ? (
              <Link href={`/berita?page=${current - 1}`} className="text-brand hover:underline">
                ← Sebelumnya
              </Link>
            ) : (
              <span />
            )}
            <span className="text-ink-muted">
              Halaman {current} dari {result.totalPages}
            </span>
            {result.hasNextPage ? (
              <Link href={`/berita?page=${current + 1}`} className="text-brand hover:underline">
                Berikutnya →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Container>
    </>
  )
}
