import type { Metadata } from 'next'
import Link from '@/components/ui/AppLink'

import { MembershipStats } from '@/components/hero/MembershipStats'
import { LegacySection } from '@/components/legacy/LegacySection'
import { LogoExplorer } from '@/components/tentang/LogoExplorer'
import { MarsPlayer } from '@/components/mars/MarsPlayer'
import { Accordion } from '@/components/ui/Accordion'
import { PolaroidCarousel } from '@/components/ui/PolaroidCarousel'
import { LabPhoto } from '@/components/ui/LabPhoto'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { SectionNav } from '@/components/ui/SectionNav'
import {
  ALASAN_PEMBENTUKAN,
  ARSIP_AWAL,
  ASAS,
  DOKUMEN_PUBLIK,
  INTRO,
  JARGON_AWAL,
  JENJANG,
  LINIMASA_HMTI,
  MARS_BAIT,
  MARS_CUES,
  MARS_JUDUL,
  MARS_PENCIPTA,
  MARS_SELESAI,
  MARS_YOUTUBE,
  MISI_AWAL,
  MISI_GBHO,
  MOTTO,
  NILAI,
  SEJARAH,
  SEJARAH_HMTI_INTRO,
  SEJARAH_JUDUL,
  SIAPA_KAMI,
  STRUKTUR,
  TUJUAN,
  VISI_AWAL,
  VISI_GBHO,
} from '@/content/tentang'
import { JTI_LINKS } from '@/lib/nav'
import { pad } from '@/lib/format'
import { DocumentList } from '@/components/ui/DocumentList'
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

      <SectionNav
        items={[
          { id: 'siapa-kami', label: 'Siapa kami' },
          { id: 'sejarah', label: 'Sejarah' },
          { id: 'kepemimpinan', label: 'Kepemimpinan' },
          { id: 'visi-misi', label: 'Visi misi' },
          { id: 'lambang', label: 'Lambang' },
          { id: 'asas-tujuan', label: 'Asas' },
          { id: 'keanggotaan', label: 'Keanggotaan' },
          { id: 'struktur', label: 'Struktur' },
          { id: 'mars', label: 'Mars' },
          { id: 'dokumen', label: 'Dokumen' },
          { id: 'jti', label: 'Jurusan' },
        ]}
      />

      <Section id="siapa-kami" title="Siapa kami">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="max-w-2xl space-y-4 text-lg text-ink-muted">
              {SIAPA_KAMI.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <p className="mt-6 font-display text-2xl font-bold">{settings.motto || MOTTO}</p>
            <LabPhoto className="mt-8 max-w-2xl" />
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

      <Section id="sejarah" tone="alt" eyebrow="Sejak 2014" title="Sejarah HMTI UNTAD">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <p className="max-w-2xl text-lg text-ink-muted">{SEJARAH_HMTI_INTRO}</p>
          <blockquote className="self-start border-l-2 border-link pl-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">Jargon periode pertama</p>
            <p className="mt-2 font-display text-xl font-bold">{JARGON_AWAL}</p>
            <p className="mt-1 font-display text-xl font-bold text-link">{MOTTO}</p>
          </blockquote>
        </div>

        <Reveal as="ol" stagger className="timeline mt-12">
          {LINIMASA_HMTI.map((t) => (
            <li key={t.date + t.title} className="timeline-item" data-key={t.key ? 'true' : undefined}>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-link">{t.date}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 max-w-2xl text-ink-muted">{t.text}</p>
              {t.images && (
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  {t.images.map((img) => (
                    <figure key={img.src} className="cv-frame border border-line bg-surface-raised p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.alt} width={img.w} height={img.h} loading="lazy" decoding="async" className="h-28 w-auto object-contain sm:h-32" />
                    </figure>
                  ))}
                </div>
              )}
            </li>
          ))}
        </Reveal>

        <Accordion
          className="mt-12"
          items={[
            {
              id: 'alasan',
              title: 'Mengapa HMTI dibentuk',
              meta: `${ALASAN_PEMBENTUKAN.length} alasan dari angkatan pertama`,
              content: (
                <ol className="max-w-3xl list-decimal space-y-2 pl-5 text-ink-muted">
                  {ALASAN_PEMBENTUKAN.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
              ),
            },
            {
              id: 'visi-awal',
              title: 'Visi dan misi periode pertama',
              meta: '2014',
              content: (
                <div className="max-w-3xl text-ink-muted">
                  <p>
                    <span className="font-medium text-ink">Visi.</span> {VISI_AWAL}
                  </p>
                  <p className="mt-3 font-medium text-ink">Misi.</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-5">
                    {MISI_AWAL.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ol>
                </div>
              ),
            },
            {
              id: 'prodi',
              title: SEJARAH_JUDUL,
              meta: 'Berdiri 16 April 2012',
              content: (
                <div className="max-w-3xl space-y-3 text-ink-muted">
                  {SEJARAH.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              ),
            },
          ]}
        />

        <div className="mt-14">
          <h3 className="font-display text-xl font-semibold">Arsip kegiatan 2014–2015</h3>
          <p className="mt-1 text-sm text-ink-muted">Penerimaan anggota dan bina akrab, Dies Natalis pertama, dan bakti sosial. Geser untuk melihat semua.</p>
          <div className="mt-4">
            <PolaroidCarousel photos={ARSIP_AWAL} label="Arsip kegiatan HMTI 2014–2015" />
          </div>
        </div>
      </Section>

      <LegacySection id="kepemimpinan" />

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
        <Reveal as="ol" stagger className="grid gap-4 md:grid-cols-5">
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
        </Reveal>
        <div className="mt-12">
          <MembershipStats numbers={false} />
        </div>
      </Section>

      <Section id="struktur" tone="alt" title="Struktur organisasi">
        <Reveal as="ul" stagger className="grid gap-4 md:grid-cols-2">
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
        </Reveal>
      </Section>

      <Section id="mars" title={MARS_JUDUL}>
        <MarsPlayer src={marsSrc} title={MARS_JUDUL} composer={MARS_PENCIPTA} youtube={MARS_YOUTUBE} bait={MARS_BAIT} cues={MARS_CUES} end={MARS_SELESAI} />
      </Section>

      <Section id="dokumen" tone="alt" title="Dokumen">
        <DocumentList
          docs={[
            ...DOKUMEN_PUBLIK.map((d) => ({ title: d.title, href: d.href, meta: `PDF ${d.size}` })),
            ...cmsDocs.flatMap((d) => {
              const file = mediaOf(d.file)
              return file?.url ? [{ title: d.title, href: file.url, meta: 'PDF' }] : []
            }),
          ]}
        />
      </Section>

      <Section id="jti" title="Jurusan dan program studi">
        <p className="max-w-2xl text-lg text-ink-muted">
          HMTI UNTAD bernaung di program studi S1 Teknik Informatika, Jurusan Teknologi Informasi, Fakultas Teknik. Informasi
          akademik resmi seperti kurikulum, dosen, dan fasilitas ada di situs jurusan.
        </p>
        <Reveal as="ul" stagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {JTI_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="dither flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-card border border-line bg-surface-raised px-5 py-3 text-ink transition-colors hover:border-brand"
              >
                <span>{l.label}</span>
                <span aria-hidden="true" className="text-ink-muted">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </Reveal>
      </Section>
    </>
  )
}
