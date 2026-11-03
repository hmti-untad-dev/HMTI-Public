import { AboutPreview } from '@/components/sections/AboutPreview'
import { FaqSection } from '@/components/sections/FaqSection'
import { GalleryPreview } from '@/components/sections/GalleryPreview'
import { Hero } from '@/components/sections/Hero'
import { NewsPreview } from '@/components/sections/NewsPreview'
import { ProgramsPreview } from '@/components/sections/ProgramsPreview'
import { ProofSection } from '@/components/sections/ProofSection'
import { ServicesPreview } from '@/components/sections/ServicesPreview'
import { TeamPreview } from '@/components/sections/TeamPreview'

/** Urutan section = urutan wireframe Main. Pindah/hapus baris untuk mengubah susunan beranda. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <TeamPreview />
      <ProgramsPreview />
      <ProofSection />
      <NewsPreview />
      <GalleryPreview />
      <ServicesPreview />
      <FaqSection />
    </>
  )
}
