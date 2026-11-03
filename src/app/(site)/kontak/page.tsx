import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { getSiteSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Kontak' }

export default async function ContactPage() {
  const { contact, socials } = await getSiteSettings()
  const rows = [
    { label: 'Alamat sekretariat', value: contact?.address },
    { label: 'Email', value: contact?.email },
    { label: 'Telepon', value: contact?.phone },
  ].filter((r) => r.value)

  return (
    <>
      <PageHeader eyebrow="Hubungi kami" title="Kontak" />
      <Container className="space-y-8 py-12">
        {rows.length === 0 && <p className="text-ink-muted">Informasi kontak belum diisi.</p>}
        <dl className="max-w-xl space-y-4">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="text-sm text-ink-muted">{r.label}</dt>
              <dd className="font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
        {contact?.mapUrl && (
          <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand hover:underline">
            Buka di peta →
          </a>
        )}
        {socials && socials.length > 0 && (
          <ul className="flex flex-wrap gap-3 text-sm">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-control border border-line px-3 py-1.5 hover:border-brand">
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}
