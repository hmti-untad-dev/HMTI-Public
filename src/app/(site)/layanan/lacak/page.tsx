import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { FormStub } from '@/components/ui/FormStub'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Lacak Permintaan' }

export default function TrackPage() {
  return (
    <>
      <PageHeader eyebrow="Layanan" title="Lacak Permintaan">
        Masukkan kode pelacakan dan email yang dipakai saat mengajukan.
      </PageHeader>
      <Container className="py-12">
        <FormStub
          submitLabel="Cek status"
          fields={[
            { name: 'trackingCode', label: 'Kode pelacakan', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
          ]}
        />
      </Container>
    </>
  )
}
