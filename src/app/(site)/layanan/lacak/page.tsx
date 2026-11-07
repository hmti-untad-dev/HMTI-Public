import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { TrackForm } from '@/components/ui/TrackForm'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Lacak Permintaan' }

export default function TrackPage() {
  return (
    <>
      <PageHeader eyebrow="Layanan" title="Lacak Permintaan">
        Masukkan kode pelacakan dan email yang dipakai saat mengajukan.
      </PageHeader>
      <Container className="py-12">
        <TrackForm />
      </Container>
    </>
  )
}
