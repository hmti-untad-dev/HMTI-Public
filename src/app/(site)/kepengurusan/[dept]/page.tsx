import { notFound } from 'next/navigation'

import { PersonCard } from '@/components/cards/PersonCard'
import { ProgramCard } from '@/components/cards/ProgramCard'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { YearSelector } from '@/components/ui/YearSelector'
import { departmentNameAt, getCabinet, getClient, resolvePeriod } from '@/lib/data'

type Props = {
  params: Promise<{ dept: string }>
  searchParams: Promise<{ periode?: string }>
}

export default async function DepartmentPage({ params, searchParams }: Props) {
  const [{ dept }, { periode }] = await Promise.all([params, searchParams])
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'departments', where: { slug: { equals: dept } }, limit: 1 })
  const department = docs[0]
  if (!department) notFound()

  const { period, periods } = await resolvePeriod(periode)
  const [cabinet, programs] = await Promise.all([
    getCabinet(period),
    payload.find({ collection: 'programs', where: { department: { equals: department.id } }, depth: 1, limit: 20 }),
  ])
  const members = cabinet.byDepartment.get(department.id) ?? []
  const name = departmentNameAt(department, period?.year)

  return (
    <>
      <PageHeader eyebrow={`Departemen ${department.group}`} title={name}>
        {department.description}
        {name !== department.name ? (
          <span className="mt-2 block text-sm text-ink-muted">Sejak {(department.formerNameUntil ?? 0) + 1} bernama {department.name}.</span>
        ) : (
          department.formerName && <span className="mt-2 block text-sm text-ink-muted">Sebelumnya bernama {department.formerName}.</span>
        )}
      </PageHeader>
      <Container className="space-y-12 py-12">
        <YearSelector
          years={periods.map((p) => p.year)}
          current={period?.year}
          hrefFor={(y) => `/kepengurusan/${department.slug}?periode=${y}`}
        />
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Anggota</h2>
          {members.length === 0 ? (
            <Empty>Belum ada anggota pada periode ini.</Empty>
          ) : (
            <div className="snap-row">
              {members.map((m) => (
                <PersonCard key={m.id} member={m} />
              ))}
            </div>
          )}
        </section>
        {programs.docs.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold">Program kerja</h2>
            <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {programs.docs.map((p) => (
                <li key={p.id}>
                  <ProgramCard program={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  )
}
