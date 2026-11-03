import type { Metadata } from 'next'
import Link from 'next/link'

import { LogoExplorer } from '@/components/tentang/LogoExplorer'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import {
  ASAS,
  DOKUMEN_PUBLIK,
  INTRO,
  JENJANG,
  MARS_BAIT,
  MARS_JUDUL,
  MARS_PENCIPTA,
  MARS_YOUTUBE,
  MISI_GBHO,
  NILAI,
  SEJARAH,
  SEJARAH_JUDUL,
  SIAPA_KAMI,
  STRUKTUR,
  TUJUAN,
  VISI_GBHO,
} from '@/content/tentang'
import { pad } from '@/lib/format'
import { getActivePeriod, getDocuments, getSiteSettings, mediaOf } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Tentang',
  description: INTRO,
}

export default async function AboutPage() {
  const [settings, period, cmsDocs] = await Promise.all([getSiteSettings(), getActivePeriod(), getDocuments()])

  // Visi-misi periode aktif dari CMS bila diisi; jika tidak, pakai GBHO.
  const visi = period?.vision || VISI_GBHO
  const misi = period?.missions?.length ? period.missions.map((m) => m.text) : MISI_GBHO
  const marsSrc = mediaOf(settings.about?.anthem)?.url ?? '/audio/mars-hmti.mp3'
  const email = settings.contact?.email

  return (
    <>
      <PageHeader eyebrow="Tentang" title="Tentang HMTI UNTAD">
        {INTRO}
      </PageHeader>

      <Section id="siapa-kami" title="Siapa kami">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="max-w-2xl space-y-4 text-lg text-ink-muted">
            {SIAPA_KAMI.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <dl className="space-y-4 self-start rounded-card border border-line bg-surface-raised p-5 text-sm">
            <div>
              <dt className="text-ink-muted">Sekretariat</dt>
              <dd className="font-medium">{settings.contact?.address || 'Laboratorium Informatika, Universitas Tadulako'}</dd>
            </div>
            {email && (
              <div>
                <dt className="text-ink-muted">Email</dt>
                <dd className="font-medium">
                  <a href={`mailto:${email}`} className="text-link hover:underline">
                    {email}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Section>

      <Section id="visi-misi" tone="alt" title="Visi dan Misi">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">Visi</h3>
            <p className="mt-3 font-serif text-3xl italic leading-snug sm:text-4xl">{visi}</p>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">Misi</h3>
            <ol className="mt-3 space-y-4">
              {misi.map((m, i) => (
                <li key={m} className="flex gap-4">
                  <span className="font-serif text-xl italic text-link">{pad(i + 1)}</span>
                  <span className="text-lg">{m}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="lambang" title="Makna lambang">
        <LogoExplorer />
      </Section>

      <Section id="asas-tujuan" tone="alt" title="Asas dan tujuan">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-semibold">Asas</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ASAS.map((a) => (
                <li key={a} className="rounded-full border border-line bg-surface-raised px-4 py-2 text-sm">
                  {a}
                </li>
              ))}
            </ul>
            <h3 className="mt-8 font-display text-xl font-semibold">Nilai aktivitas</h3>
            <p className="mt-3 max-w-md text-ink-muted">{NILAI.join(', ')}.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Maksud dan tujuan</h3>
            <ol className="mt-4 space-y-3 text-ink-muted">
              {TUJUAN.map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="font-mono text-sm text-link">{pad(i + 1)}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="keanggotaan" title="Jenjang keanggotaan">
        <ol className="grid gap-4 md:grid-cols-5">
          {JENJANG.map((j, i) => (
            <li key={j.name} className="relative rounded-card border border-line bg-surface-raised p-5">
              <p className="font-mono text-xs text-ink-muted">{pad(i + 1)}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{j.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{j.text}</p>
              {i < JENJANG.length - 1 && (
                <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-ink-muted md:block">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="struktur" tone="alt" title="Struktur organisasi">
        <ul className="grid gap-4 md:grid-cols-2">
          {STRUKTUR.map((s) => (
            <li key={s.name} className="rounded-card border border-line bg-surface-raised p-6">
              <h3 className="font-display text-xl font-semibold">{s.name}</h3>
              <p className="mt-2 text-ink-muted">{s.text}</p>
              {s.href && (
                <Link href={s.href} className="mt-4 inline-block text-sm font-medium text-link hover:underline">
                  {s.cta} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="sejarah" title={SEJARAH_JUDUL}>
        <div className="max-w-2xl space-y-4 text-lg text-ink-muted">
          {SEJARAH.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Section>

      <Section id="mars" tone="alt" title={MARS_JUDUL}>
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
          <div className="self-start">
            <p className="text-sm text-ink-muted">{MARS_PENCIPTA}</p>
            <audio controls preload="none" src={marsSrc} className="mt-4 w-full">
              Peramban Anda tidak mendukung pemutar audio.
            </audio>
            <a
              href={MARS_YOUTUBE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-link hover:underline"
            >
              Dengarkan di YouTube →
            </a>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {MARS_BAIT.map((bait, i) => (
              <p key={i} className="space-y-1 font-serif text-lg italic leading-snug">
                {bait.map((baris) => (
                  <span key={baris} className="block">
                    {baris}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section id="dokumen" title="Dokumen">
        <ul className="max-w-2xl divide-y divide-line rounded-card border border-line bg-surface-raised">
          {DOKUMEN_PUBLIK.map((d) => (
            <li key={d.href} className="flex items-center justify-between gap-4 p-4 text-sm">
              <span>
                {d.title} <span className="text-ink-muted">· PDF {d.size}</span>
              </span>
              <a href={d.href} download className="font-medium text-link hover:underline">
                Unduh
              </a>
            </li>
          ))}
          {cmsDocs.map((d) => {
            const file = mediaOf(d.file)
            return file?.url ? (
              <li key={d.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <span>{d.title}</span>
                <a href={file.url} download className="font-medium text-link hover:underline">
                  Unduh
                </a>
              </li>
            ) : null
          })}
        </ul>
      </Section>
    </>
  )
}
