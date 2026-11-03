import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { FormStub } from '@/components/ui/FormStub'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Aspirasi' }

export default function AspirationPage() {
  return (
    <>
      <PageHeader eyebrow="Suara mahasiswa" title="Aspirasi">
        Sampaikan saran, kritik, atau ide untuk himpunan.
      </PageHeader>
      <Container className="py-12">
        <FormStub
          submitLabel="Kirim aspirasi"
          fields={[
            { name: 'name', label: 'Nama (opsional)' },
            { name: 'message', label: 'Pesan', type: 'textarea', required: true },
          ]}
        />
      </Container>
    </>
  )
}
