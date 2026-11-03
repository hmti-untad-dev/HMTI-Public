import type { Metadata } from 'next'

import { PersonCard } from '@/components/cards/PersonCard'
import { DepartmentBlock } from '@/components/sections/DepartmentBlock'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { YearSelector } from '@/components/ui/YearSelector'
import { getCabinet, resolvePeriod } from '@/lib/data'

export const metadata: Metadata = { title: 'Kepengurusan' }

const GROUPS = [
  { value: 'internal', label: 'Internal' },
  { value: 'eksternal', label: 'Eksternal' },
] as const

export default async function CabinetPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const { periode } = await searchParams
  const { period, periods } = await resolvePeriod(periode)
  const cabinet = await getCabinet(period)

  // Nomor urut global: BPH dulu, lalu tiap departemen sesuai urutan tampil.
  const numbering = new Map<number, number>()
  let n = 0
  for (const m of cabinet.bph) numbering.set(m.id, ++n)
  for (const d of cabinet.departments) for (const m of cabinet.byDepartment.get(d.id) ?? []) numbering.set(m.id, ++n)

  return (
    <>
      <PageHeader eyebrow={period?.cabinetName ?? 'Kepengurusan'} title={period ? `Pengurus ${period.year}` : 'Kepengurusan'}>
        {period?.theme}
      </PageHeader>

      <Container className="space-y-12 py-12">
        <YearSelector
          years={periods.map((p) => p.year)}
          current={period?.year}
          hrefFor={(y) => `/kepengurusan?periode=${y}`}
        />

        {!period || cabinet.total === 0 ? (
          <Empty>Data pengurus periode ini belum diisi.</Empty>
        ) : (
          <>
            <section aria-labelledby="bph">
              <h2 id="bph" className="mb-4 font-display text-2xl font-bold">
                Badan Pengurus Harian
              </h2>
              <div className="snap-row">
                {cabinet.bph.map((m) => (
                  <PersonCard key={m.id} member={m} index={numbering.get(m.id)} total={cabinet.total} />
                ))}
              </div>
            </section>

            {GROUPS.map((g) => {
              const departments = cabinet.departments.filter((d) => d.group === g.value)
              if (departments.length === 0) return null
              return (
                <section key={g.value} aria-labelledby={g.value}>
                  <h2 id={g.value} className="mb-4 font-display text-2xl font-bold">
                    {g.label}
                  </h2>
                  <div className="space-y-6">
                    {departments.map((d) => (
                      <DepartmentBlock
                        key={d.id}
                        department={d}
                        members={cabinet.byDepartment.get(d.id) ?? []}
                        numbering={numbering}
                        total={cabinet.total}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </Container>
    </>
  )
}
