import { ActivitySection } from '@/components/sections/ActivitySections'
import { AboutPreview } from '@/components/sections/AboutPreview'
import { FaqSection } from '@/components/sections/FaqSection'
import { GalleryPreview } from '@/components/sections/GalleryPreview'
import { Hero } from '@/components/sections/Hero'
import { LegacySection } from '@/components/legacy/LegacySection'
import { NewsPreview } from '@/components/sections/NewsPreview'
import { ProgramsPreview } from '@/components/sections/ProgramsPreview'
import { ProofSection } from '@/components/sections/ProofSection'
import { ServicesPreview } from '@/components/sections/ServicesPreview'
import { TeamPreview } from '@/components/sections/TeamPreview'
import { getActivePeriod } from '@/lib/data'

/** Urutan section = urutan wireframe Main. Pindah/hapus baris untuk mengubah susunan beranda. */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ tahun?: string; periode?: string }> }) {
  const [period, { tahun, periode }] = await Promise.all([getActivePeriod(), searchParams])
  return (
    <>
      <Hero />
      <AboutPreview />
      <LegacySection tone="alt" />
      <TeamPreview periode={periode} />
      <ProgramsPreview />
      <ActivitySection period={period} year={Number(tahun) || undefined} hrefFor={(y) => `/?tahun=${y}${periode ? `&periode=${periode}` : ''}#denyut`} />
      <ProofSection />
      <NewsPreview />
      <GalleryPreview />
      <ServicesPreview />
      <FaqSection />
    </>
  )
}
