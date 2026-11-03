import type { Metadata } from 'next'

import { Empty } from '@/components/ui/Empty'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { getActivePeriod, getDocuments, getSiteSettings, mediaOf } from '@/lib/data'

export const metadata: Metadata = { title: 'Tentang' }

export default async function AboutPage() {
  const [settings, period, documents] = await Promise.all([getSiteSettings(), getActivePeriod(), getDocuments()])
  const anthem = mediaOf(settings.about?.anthem)

  return (
    <>
      <PageHeader eyebrow="Tentang" title={settings.orgFullName || 'Tentang Kami'}>
        {settings.tagline}
      </PageHeader>

      <Section id="sejarah" title="Sejarah">
        {settings.about?.history ? <RichText data={settings.about.history} /> : <Empty>Sejarah belum diisi.</Empty>}
      </Section>

      <Section id="visi" tone="alt" title="Visi">
        {period?.vision ? <p className="max-w-3xl text-lg">{period.vision}</p> : <Empty>Visi belum diisi.</Empty>}
      </Section>

      <Section id="misi" title="Misi">
        {period?.missions?.length ? (
          <ol className="max-w-3xl list-decimal space-y-2 pl-5">
            {period.missions.map((m) => (
              <li key={m.id}>{m.text}</li>
            ))}
          </ol>
        ) : (
          <Empty>Misi belum diisi.</Empty>
        )}
      </Section>

      <Section id="lagu" tone="alt" title={settings.about?.anthemTitle || 'Lagu'}>
        {anthem?.url ? (
          <audio controls src={anthem.url} className="w-full max-w-xl">
            Browser tidak mendukung pemutar audio.
          </audio>
        ) : (
          <Empty>Lagu belum diunggah.</Empty>
        )}
      </Section>

      <Section id="dokumen" title="Dokumen">
        {documents.length === 0 ? (
          <Empty>Belum ada dokumen.</Empty>
        ) : (
          <ul className="max-w-xl divide-y divide-line rounded-card border border-line">
            {documents.map((d) => {
              const file = mediaOf(d.file)
              return (
                <li key={d.id} className="flex items-center justify-between gap-4 p-3 text-sm">
                  <span>{d.title}</span>
                  {file?.url && (
                    <a href={file.url} className="font-medium text-link hover:underline" download>
                      Unduh
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </>
  )
}
