import Link from 'next/link'

import { getActivePeriod, getCabinet } from '@/lib/data'
import { PersonCard } from '../cards/PersonCard'
import { Empty } from '../ui/Empty'
import { Section } from '../ui/Section'

/** Urutan tampil BPH: Ketua I, Sekum, Ketua Umum (tengah), Bendum, Ketua II — sesuai wireframe. */
const BPH_ORDER = ['ketua1', 'sekum', 'ketua', 'bendum', 'ketua2']

export async function TeamPreview() {
  const period = await getActivePeriod()
  const { bph, departments } = await getCabinet(period)
  const ordered = BPH_ORDER.flatMap((pos) => bph.filter((m) => m.position === pos))

  return (
    <Section
      tone="alt"
      eyebrow={period ? `Periode ${period.year}` : undefined}
      title="Kenali Tim Kami"
      action={{ href: '/kepengurusan', label: 'Lihat semua pengurus' }}
    >
      {ordered.length === 0 ? (
        <Empty>Data pengurus belum diisi.</Empty>
      ) : (
        <div className="snap-row justify-start lg:justify-center">
          {ordered.map((m, i) => (
            <PersonCard key={m.id} member={m} index={i + 1} total={ordered.length} />
          ))}
        </div>
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
              className="w-40 rounded-card border border-line bg-surface p-4 hover:border-brand"
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
