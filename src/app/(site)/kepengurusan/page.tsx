import type { Metadata } from 'next'

import { AllBlueSection } from '@/components/kabinet/AllBlueSection'
import { CabinetShowcase, type ShowcaseGroup } from '@/components/sections/CabinetShowcase'
import { ALL_BLUE } from '@/content/kabinet'
import { Container } from '@/components/ui/Container'
import { Empty } from '@/components/ui/Empty'
import { YearSelector } from '@/components/ui/YearSelector'
import { type CabinetMember, getCabinet, getSiteSettings, resolvePeriod } from '@/lib/data'
import { roleLabel } from '@/lib/format'

export const metadata: Metadata = { title: 'Kepengurusan' }

function toShowcase(m: CabinetMember) {
  return {
    id: m.id,
    name: m.person.name,
    role: roleLabel(m.position, m.department?.name),
    photoUrl: m.photo?.url ?? null,
    instagram: m.person.instagram ?? null,
    poster: m.poster,
  }
}

export default async function CabinetPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const { periode } = await searchParams
  const [{ period, periods }, settings] = await Promise.all([resolvePeriod(periode), getSiteSettings()])
  const cabinet = await getCabinet(period)

  const groups: ShowcaseGroup[] = [
    { key: 'bph', label: 'BPH', title: 'Badan Pengurus Harian', members: cabinet.bph.map(toShowcase) },
    { key: 'koordinator', label: 'Koordinator', title: 'Koordinator Departemen', members: cabinet.coordinators.map(toShowcase) },
    ...cabinet.departments.map((d) => ({
      key: d.slug,
      label: d.name,
      title: d.name,
      // Koordinator sudah ada di tab "Koordinator"; tab departemen berisi anggotanya saja.
      members: (cabinet.byDepartment.get(d.id) ?? []).filter((m) => m.position !== 'koordinator').map(toShowcase),
    })),
    { key: 'pengawas', label: 'BPO', title: 'Badan Pengawas Organisasi', members: cabinet.pengawas.map(toShowcase) },
    { key: 'pembina', label: 'Pembina', title: 'Pembina', members: cabinet.pembina.map(toShowcase) },
  ].filter((g) => g.members.length > 0)

  return (
    <>
      <Container className="py-6">
        <YearSelector
          years={periods.map((p) => p.year)}
          current={period?.year}
          hrefFor={(y) => `/kepengurusan?periode=${y}`}
        />
      </Container>

      {/* Filosofi dan lambang kabinet: saat ini hanya Kabinet All Blue (2026) yang materinya sudah ada. */}
      {period?.year === ALL_BLUE.year && <AllBlueSection />}

      {period && groups.length > 0 ? (
        // key memaksa state komponen (tab & indeks) direset saat periode berganti.
        <CabinetShowcase key={period.id} orgName={settings.orgName || 'HMTI'} year={period.year} groups={groups} />
      ) : (
        <Container className="pb-16">
          <Empty>Data pengurus periode ini belum diisi.</Empty>
        </Container>
      )}
    </>
  )
}
