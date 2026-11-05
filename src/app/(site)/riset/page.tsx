import type { Metadata } from 'next'
import Link from 'next/link'

import { ResearchCard } from '@/components/cards/ResearchCard'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { getClient, getResearches } from '@/lib/data'

export const metadata: Metadata = { title: 'Hasil Riset' }

/** Departemen yang menerbitkan riset dan artikel keilmuan (urutan tampil). */
const PUBLISHERS = ['rinoya', 'intelektual', 'humas']

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ dept?: string; page?: string }> }) {
  const { dept, page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const payload = await getClient()
  const [{ docs: departments }, result] = await Promise.all([
    payload.find({ collection: 'departments', where: { slug: { in: PUBLISHERS } }, limit: 10, depth: 0 }),
    getResearches({ department: dept && PUBLISHERS.includes(dept) ? dept : undefined, limit: 9, page: current }),
  ])
  const tabs = PUBLISHERS.flatMap((slug) => departments.filter((d) => d.slug === slug))
  const active = dept && PUBLISHERS.includes(dept) ? dept : undefined
  const qs = (p: number) => new URLSearchParams({ ...(active ? { dept: active } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()
  const chip = 'flex h-9 items-center border px-3 text-sm'

  return (
    <>
      <PageHeader eyebrow="Temuan dan keilmuan" title="Hasil Riset">
        Riset, temuan, dan artikel keilmuan dari Riset Inovasi dan Karya, Intelektual, dan Humas.
      </PageHeader>
      <Container className="space-y-10 py-12">
        <nav aria-label="Saring departemen" className="flex flex-wrap items-center gap-2">
          <Link href="/riset" aria-current={!active ? 'page' : undefined} className={`${chip} ${!active ? 'border-brand bg-brand text-on-brand' : 'border-line hover:border-brand'}`}>
            Semua
          </Link>
          {tabs.map((d) => (
            <Link
              key={d.id}
              href={`/riset?dept=${d.slug}`}
              aria-current={active === d.slug ? 'page' : undefined}
              className={`${chip} ${active === d.slug ? 'border-brand bg-brand text-on-brand' : 'border-line hover:border-brand'}`}
            >
              {d.name}
            </Link>
          ))}
        </nav>

        {result.docs.length === 0 ? (
          <Empty>{active ? 'Belum ada publikasi dari departemen ini.' : 'Belum ada hasil riset yang diterbitkan.'}</Empty>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {result.docs.map((item) => (
              <li key={item.id}>
                <ResearchCard item={item} />
              </li>
            ))}
          </ul>
        )}

        {result.totalPages > 1 && (
          <nav aria-label="Halaman hasil riset" className="flex items-center justify-between text-sm">
            {result.hasPrevPage ? (
              <Link href={`/riset?${qs(current - 1)}`} className="text-link hover:underline">
                ← Sebelumnya
              </Link>
            ) : (
              <span />
            )}
            <span className="text-ink-muted">
              Halaman {current} dari {result.totalPages}
            </span>
            {result.hasNextPage ? (
              <Link href={`/riset?${qs(current + 1)}`} className="text-link hover:underline">
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
