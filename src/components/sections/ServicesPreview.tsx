import { getServices } from '@/lib/data'
import { Section } from '../ui/Section'
import { ServicesGrid } from './ServicesGrid'

export async function ServicesPreview() {
  const services = await getServices()
  return (
    <Section eyebrow="Layanan" title="Layanan Kami" action={{ href: '/layanan', label: 'Semua layanan' }}>
      <ServicesGrid services={services} />
    </Section>
  )
}
