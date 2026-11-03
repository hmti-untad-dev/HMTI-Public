import type { Metadata } from 'next'
import Link from 'next/link'

import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { getServices } from '@/lib/data'

export const metadata: Metadata = { title: 'Layanan' }

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <>
      <PageHeader eyebrow="Layanan" title="Layanan Kami">
        Layanan untuk mahasiswa, organisasi, dan mitra. Pilih layanan untuk mengajukan permintaan.
      </PageHeader>
      <Container className="space-y-8 py-12">
        <ServicesGrid services={services} />
        <p className="text-sm text-ink-muted">
          Sudah mengajukan?{' '}
          <Link href="/layanan/lacak" className="font-medium text-brand hover:underline">
            Lacak status permintaan
          </Link>
        </p>
      </Container>
    </>
  )
}
