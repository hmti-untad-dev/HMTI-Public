import Link from 'next/link'

import { getCabinet, resolvePeriod } from '@/lib/data'
import { PersonCard } from '../cards/PersonCard'
import { Empty } from '../ui/Empty'
import { Section } from '../ui/Section'
import { YearSelector } from '../ui/YearSelector'

/** Urutan tampil BPH: Ketua I, Sekum, Ketua Umum (tengah), Bendum, Ketua II — sesuai wireframe. */
const BPH_ORDER = ['ketua1', 'sekum', 'ketua', 'bendum', 'ketua2']

type Props = {
  /** Periode yang dipilih lewat ?periode=; jatuh ke periode aktif bila kosong. */
  periode?: string
}

export async function TeamPreview({ periode }: Props) {
  const { period, periods } = await resolvePeriod(periode)
  const { bph, coordinators, departments } = await getCabinet(period)
  const ordered = BPH_ORDER.flatMap((pos) => bph.filter((m) => m.position === pos))

  return (
    <Section
      id="tim"
      eyebrow={period ? `Periode ${period.year}` : undefined}
      title="Kenali Tim Kami"
      action={{ href: '/kepengurusan', label: 'Lihat semua pengurus' }}
    >
      <div className="mb-8">
        <YearSelector years={periods.map((p) => p.year)} current={period?.year} hrefFor={(y) => `/?periode=${y}#tim`} />
      </div>
      {ordered.length === 0 ? (
        <Empty>Data pengurus belum diisi.</Empty>
      ) : (
        <div className="snap-row justify-start lg:[justify-content:safe_center]">
          {ordered.map((m, i) => (
            <PersonCard key={m.id} member={m} index={i + 1} total={ordered.length} />
          ))}
        </div>
      )}

      {coordinators.length > 0 && (
        <>
          <h3 className="mb-4 mt-12 font-display text-lg font-semibold">Koordinator departemen</h3>
          <div className="snap-row justify-start lg:[justify-content:safe_center]">
            {coordinators.map((m, i) => (
              <PersonCard key={m.id} member={m} index={i + 1} total={coordinators.length} />
            ))}
          </div>
        </>
      )}

      <h3 className="mb-4 mt-12 font-display text-lg font-semibold">Departemen</h3>
      {departments.length === 0 ? (
        <Empty>Departemen belum diisi.</Empty>
      ) : (
        <div className="snap-row">
          {departments.map((d) => (
            <Link
              key={d.id}
              href={`/kepengurusan/${d.slug}`}
              className="lift w-40 rounded-card border border-line bg-surface p-4 hover:border-brand"
            >
              <p className="text-xs uppercase tracking-wider text-ink-muted">{d.group}</p>
              <p className="mt-1 font-display font-semibold">{d.name}</p>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
