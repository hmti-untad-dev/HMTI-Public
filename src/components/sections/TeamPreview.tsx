import Link from '@/components/ui/AppLink'

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
          {/* Grid, bukan baris geser: semua koordinator terlihat tanpa scroll ke samping. */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
            {coordinators.map((m, i) => (
              <PersonCard key={m.id} member={m} index={i + 1} total={coordinators.length} compact />
            ))}
          </div>
        </>
      )}

      <h3 className="mb-4 mt-12 font-display text-lg font-semibold">Departemen</h3>
      {departments.length === 0 ? (
        <Empty>Departemen belum diisi.</Empty>
      ) : (
        // Grid (bukan baris geser): wadah overflow-x memotong kartu yang terangkat saat hover.
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {departments.map((d, i) => (
            <Link
              key={d.id}
              href={`/kepengurusan/${d.slug}`}
              className="group lift relative flex min-h-24 flex-col justify-between border border-line bg-surface p-4 hover:border-brand hover:bg-surface-raised"
            >
              <span className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wider text-ink-muted">
                <span>{d.group}</span>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="mt-3 flex items-end justify-between gap-2">
                <span className="font-display font-semibold leading-tight">{d.name}</span>
                <span aria-hidden="true" className="text-link opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
