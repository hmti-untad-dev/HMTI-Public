import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/format'
import { getEditions, getProgram } from '@/lib/data'

export default async function ProgramPage({ params }: { params: Promise<{ program: string }> }) {
  const { program: slug } = await params
  const program = await getProgram(slug)
  if (!program) notFound()

  const editions = await getEditions(program.id)
  const department = typeof program.department === 'object' ? program.department : null

  return (
    <>
      <PageHeader eyebrow={department?.name ?? 'Program kerja'} title={program.name}>
        {program.summary}
      </PageHeader>
      <Container className="py-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Edisi</h2>
        {editions.length === 0 ? (
          <Empty>Belum ada edisi.</Empty>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {editions.map((e) => {
              const year = e.startDate ? new Date(e.startDate).getFullYear() : typeof e.period === 'object' ? e.period.year : null
              return (
                <li key={e.id}>
                  <Link
                    href={`/kegiatan/${program.slug}/${year ?? e.id}`}
                    className="block rounded-card border border-line p-4 hover:border-brand"
                  >
                    <p className="font-display font-semibold">{e.title}</p>
                    <p className="text-sm text-ink-muted">{[formatDate(e.startDate), e.location].filter(Boolean).join(' · ')}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Container>
    </>
  )
}
