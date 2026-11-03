import { Section } from '../ui/Section'
import { Achievements } from './Achievements'
import { Testimonials } from './Testimonials'

/** Prestasi + Testimoni berdampingan (sesuai wireframe). Pecah jadi dua section bila gaya final menuntutnya. */
export function ProofSection() {
  return (
    <Section tone="alt">
      <div className="grid gap-10 lg:grid-cols-2">
        <Achievements />
        <Testimonials />
      </div>
    </Section>
  )
}
