import type { Metadata } from 'next'

import { ContactForm } from '@/components/ui/ContactForm'
import { Container } from '@/components/ui/Container'
import { LabPhoto } from '@/components/ui/LabPhoto'
import { PageHeader } from '@/components/ui/PageHeader'
import { getSiteSettings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Kirim pesan ke HMTI UNTAD untuk pertanyaan, kerja sama, media partner, atau jasa teknologi.',
}

const TOPICS = ['Pertanyaan umum', 'Kerja sama', 'Media partner', 'Jasa website', 'Jasa desain', 'Konsultasi', 'Service hardware', 'Lainnya']

export default async function ContactPage() {
  const { contact, socials } = await getSiteSettings()
  const rows = [
    { label: 'Sekretariat', value: contact?.address },
    { label: 'Email', value: contact?.email, href: contact?.email ? `mailto:${contact.email}` : undefined },
    { label: 'Telepon', value: contact?.phone, href: contact?.phone ? `tel:${contact.phone.replace(/\s/g, '')}` : undefined },
  ].filter((r) => r.value)

  return (
    <>
      <PageHeader eyebrow="Hubungi kami" title="Kontak">
        Kirim pesan langsung dari halaman ini. Pesanmu masuk ke email himpunan dan dibalas oleh pengurus.
      </PageHeader>

      <Container className="grid gap-12 py-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section id="pesan" aria-labelledby="pesan-judul" className="scroll-mt-28">
          <h2 id="pesan-judul" className="font-display text-2xl font-bold">
            Kirim pesan
          </h2>
          <p className="mb-6 mt-1 text-ink-muted">Untuk pertanyaan, kerja sama, media partner, atau jasa. Kolom bertanda wajib harus diisi.</p>
          <ContactForm source="kontak" topics={TOPICS} />
        </section>

        <aside aria-label="Informasi kontak" className="space-y-8">
          {rows.length > 0 && (
            <dl className="space-y-4 border border-line bg-surface-raised p-5">
              {rows.map((r) => (
                <div key={r.label}>
                  <dt className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">{r.label}</dt>
                  <dd className="mt-0.5 font-medium">
                    {r.href ? (
                      <a href={r.href} className="text-link hover:underline">
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                </div>
              ))}
              {contact?.mapUrl && (
                <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-link hover:underline">
                  Buka di peta ↗
                </a>
              )}
            </dl>
          )}
          {socials && socials.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">Media sosial</p>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block border border-line px-3 py-1.5 hover:border-brand">
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <LabPhoto />
        </aside>
      </Container>
    </>
  )
}
