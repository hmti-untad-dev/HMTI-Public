import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { ContactForm } from '@/components/ui/ContactForm'
import { LetterRequestForm } from '@/components/ui/LetterRequestForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { getActiveLoans, getPublicInventory, getService } from '@/lib/data'

/** Petunjuk kolom keterangan per layanan organisasi. */
const LETTER_HINT: Record<string, string> = {
  'peminjaman-inventaris': 'Tambahkan keperluan peminjaman, narahubung, dan rencana waktu pengambilan barang.',
  penyuratan: 'Jelaskan surat yang kamu butuhkan dan untuk keperluan apa.',
  'media-partner': 'Sebutkan nama kegiatan, tanggal, dan bentuk publikasi yang diharapkan.',
  'kerja-sama': 'Jelaskan bentuk kerja sama yang ditawarkan dan narahubungnya.',
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params
  const service = await getService(slug)
  if (!service) notFound()
  const isLoan = service.slug === 'peminjaman-inventaris'
  const [inventory, loans] = isLoan ? await Promise.all([getPublicInventory(), getActiveLoans()]) : [[], []]
  const loan = isLoan ? { items: inventory.filter((i) => i.loanable), loans } : undefined

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
            {service.group === 'organisasi' ? (
              <>
                <p className="mb-6 mt-1 text-ink-muted">
                  Unggah surat resmi dari organisasi atau instansimu. Suratnya langsung diterima pengurus, dan kamu mendapat kode untuk melacak statusnya.
                </p>
                <LetterRequestForm service={service.slug} serviceName={service.name} hint={LETTER_HINT[service.slug]} loan={loan} />
              </>
            ) : (
              <>
                <p className="mb-6 mt-1 text-ink-muted">Permintaanmu masuk ke pengurus yang menangani layanan ini dan dibalas lewat email atau WhatsApp.</p>
                <ContactForm
                  source="layanan"
                  topic={service.name}
                  hint="Jelaskan kebutuhan, contoh referensi bila ada, dan tenggat waktu."
                  submitLabel="Kirim permintaan"
                />
              </>
            )}
          </section>
        ) : (
          <p className="text-ink-muted">Layanan ini sedang tidak menerima permintaan.</p>
        )}
      </Container>
    </>
  )
}
