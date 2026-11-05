import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { ContactForm } from '@/components/ui/ContactForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { getService } from '@/lib/data'

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  return (
    <>
      <PageHeader eyebrow={service.group === 'bisnis' ? 'Layanan bisnis' : 'Layanan organisasi'} title={service.name}>
        {service.summary}
      </PageHeader>
      <Container className="space-y-10 py-12">
        {service.description && <RichText data={service.description} />}
        {service.active ? (
          <section aria-labelledby="ajukan-judul" className="max-w-3xl">
            <h2 id="ajukan-judul" className="font-display text-2xl font-bold">
              Ajukan {service.name.toLowerCase()}
            </h2>
            <p className="mb-6 mt-1 text-ink-muted">Permintaanmu masuk ke pengurus yang menangani layanan ini dan dibalas lewat email atau WhatsApp.</p>
            <ContactForm
              source="layanan"
              topic={service.name}
              hint={service.group === 'bisnis' ? 'Jelaskan kebutuhan, contoh referensi bila ada, dan tenggat waktu.' : 'Sebutkan nama organisasi/instansi, kegiatan, tanggal, dan kebutuhanmu.'}
              submitLabel="Kirim permintaan"
            />
          </section>
        ) : (
          <p className="text-ink-muted">Layanan ini sedang tidak menerima permintaan.</p>
        )}
      </Container>
    </>
  )
}
