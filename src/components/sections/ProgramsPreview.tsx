import { getPrograms } from '@/lib/data'
import { ProgramCard } from '../cards/ProgramCard'
import { Empty } from '../ui/Empty'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'

export async function ProgramsPreview() {
  const programs = await getPrograms({ featured: true })
  return (
    <Section tone="alt" eyebrow="Program kerja" title="Kegiatan" action={{ href: '/kegiatan', label: 'Lihat semua' }}>
      {programs.length === 0 ? (
        <Empty>Belum ada kegiatan unggulan.</Empty>
      ) : (
        <Reveal as="ul" stagger className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {programs.slice(0, 4).map((p) => (
            <li key={p.id}>
              <ProgramCard program={p} />
            </li>
          ))}
        </Reveal>
      )}
    </Section>
  )
}
