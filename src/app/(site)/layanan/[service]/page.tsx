import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { FormStub } from '@/components/ui/FormStub'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { getService } from '@/lib/data'

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  // Field dasar pemohon selalu ada; field khusus layanan datang dari CMS.
  const fields = [
    { name: 'applicantName', label: 'Nama', required: true },
    { name: 'applicantEmail', label: 'Email', type: 'email', required: true },
    { name: 'applicantPhone', label: 'Telepon / WA', type: 'tel' },
    ...(service.formFields ?? []),
  ]

  return (
    <>
      <PageHeader eyebrow={service.group === 'bisnis' ? 'Layanan bisnis' : 'Layanan organisasi'} title={service.name}>
        {service.summary}
      </PageHeader>
      <Container className="space-y-10 py-12">
        {service.description && <RichText data={service.description} />}
        {service.active ? (
          <FormStub fields={fields} submitLabel="Ajukan" />
        ) : (
          <p className="text-ink-muted">Layanan ini sedang tidak menerima permintaan.</p>
        )}
      </Container>
    </>
  )
}
