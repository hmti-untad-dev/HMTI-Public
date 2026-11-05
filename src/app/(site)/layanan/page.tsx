import type { Metadata } from 'next'
import Link from 'next/link'

import { ProgramCard } from '@/components/cards/ProgramCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CountUp } from '@/components/ui/CountUp'
import { DecodeText } from '@/components/ui/DecodeText'
import { Empty } from '@/components/ui/Empty'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { getActivePeriod, getCabinet, getPrograms, getServices } from '@/lib/data'
import { pad } from '@/lib/format'
import type { Service } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Layanan',
  description: 'Kerja sama, media partner, peminjaman inventaris, dan jasa teknologi dari HMTI UNTAD: website, desain, konsultasi, dan service hardware.',
}

const TRACKS = [
  {
    group: 'organisasi',
    id: 'organisasi',
    eyebrow: 'Untuk organisasi dan instansi',
    title: 'Kolaborasi dan dukungan kegiatan',
    text: 'Bangun acara, publikasi, atau program bersama himpunan mahasiswa Informatika Universitas Tadulako.',
  },
  {
    group: 'bisnis',
    id: 'jasa',
    eyebrow: 'Untuk usaha dan perorangan',
    title: 'Jasa teknologi dari mahasiswa Informatika',
    text: 'Website, desain, konsultasi, dan perbaikan perangkat, dikerjakan pengurus dan anggota HMTI UNTAD.',
  },
] as const

/** Alasan bekerja sama, hanya berisi hal yang benar-benar ada di situs ini (data CMS dan sejarah himpunan). */
function reasons(total: number, departments: number) {
  return [
    { title: 'Tim mahasiswa Informatika', text: `${total} pengurus aktif di ${departments} departemen, dari kesekretariatan sampai riset dan inovasi.` },
    { title: 'Terbiasa menggelar acara', text: 'Informatics Festival, Pengabdian Masyarakat, Dies Natalis, dan forum bulanan IBM rutin kami jalankan.' },
    { title: 'Berdiri sejak 2014', text: 'Lebih dari satu dekade menjadi wadah mahasiswa Teknik Informatika Universitas Tadulako.' },
    { title: 'Satu pintu, dibalas langsung', text: 'Permintaanmu masuk ke pengurus yang menangani layanannya dan dibalas lewat email atau WhatsApp.' },
  ]
}

const STEPS = [
  { title: 'Pilih layanan', text: 'Buka layanan yang sesuai dan isi formulir singkat: kebutuhan, waktu, dan kontakmu.' },
  { title: 'Ditinjau pengurus', text: 'Departemen terkait meninjau permintaan dan menghubungimu untuk detail atau penawaran.' },
  { title: 'Disepakati', text: 'Ruang lingkup, jadwal, dan biaya (bila ada) disepakati bersama sebelum mulai.' },
  { title: 'Dikerjakan', text: 'Pekerjaan berjalan sesuai kesepakatan, dengan satu kontak pengurus yang bisa kamu hubungi.' },
]

function ServiceList({ services }: { services: Service[] }) {
  if (services.length === 0) return <Empty>Layanan belum diisi.</Empty>
  return (
    <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
      {services.map((s, i) => (
        <li key={s.id} className="bg-surface">
          <Link href={`/layanan/${s.slug}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-surface-raised sm:p-6" data-tilt>
            <span className="font-mono text-xs text-ink-muted">{pad(i + 1)}</span>
            <span className="mt-3 font-display text-lg font-semibold group-hover:text-link">{s.name}</span>
            {s.summary && <span className="mt-1.5 flex-1 text-sm text-ink-muted">{s.summary}</span>}
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-link">
              {s.active ? 'Ajukan' : 'Sedang tutup'}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function ServicesPage() {
  const [services, period, programs] = await Promise.all([getServices(), getActivePeriod(), getPrograms({ featured: true })])
  const cabinet = await getCabinet(period)

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div data-enter>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-link">
              <DecodeText text="Layanan HMTI UNTAD" />
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.08] sm:text-5xl">Kerjakan bersama mahasiswa Informatika UNTAD.</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">
              Dari kerja sama acara dan media partner sampai pembuatan website dan desain. Ceritakan kebutuhanmu, pengurus kami yang menindaklanjuti.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/layanan/kerja-sama">Ajukan kerja sama</Button>
              <Button href="#jasa" variant="outline">
                Lihat jasa
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-px border border-line bg-line" data-enter>
            {[
              { label: 'Pengurus aktif', value: cabinet.total },
              { label: 'Departemen', value: cabinet.departments.length },
              { label: 'Tahun berdiri', value: 2014, plain: true },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-4">
                <dd className="font-display text-2xl font-bold text-link sm:text-3xl">{s.plain ? s.value : <CountUp value={s.value} />}</dd>
                <dt className="mt-1 text-xs text-ink-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </header>

      {TRACKS.map((t, i) => (
        <Section key={t.id} id={t.id} tone={i % 2 ? 'alt' : 'default'} eyebrow={t.eyebrow} title={t.title}>
          <p className="-mt-4 mb-8 max-w-2xl text-ink-muted">{t.text}</p>
          <ServiceList services={services.filter((s) => s.group === t.group)} />
        </Section>
      ))}

      <Section id="kenapa" eyebrow="Kenapa HMTI UNTAD" title="Alasan bekerja sama dengan kami">
        <Reveal as="ul" stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons(cabinet.total, cabinet.departments.length).map((r, i) => (
            <li key={r.title} className="border-t-2 border-link pt-4">
              <span className="font-mono text-xs text-ink-muted">{pad(i + 1)}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{r.text}</p>
            </li>
          ))}
        </Reveal>
      </Section>

      <Section id="alur" tone="alt" eyebrow="Alur" title="Dari pesan sampai selesai">
        <Reveal as="ol" stagger className="grid gap-px border border-line bg-line md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-surface p-5">
              <span className="font-mono text-sm text-link">{pad(i + 1)}</span>
              <h3 className="mt-2 font-display font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
            </li>
          ))}
        </Reveal>
      </Section>

      {programs.length > 0 && (
        <Section id="jejak" eyebrow="Jejak kegiatan" title="Yang sudah kami jalankan" action={{ href: '/kegiatan', label: 'Semua kegiatan' }}>
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {programs.slice(0, 4).map((p) => (
              <li key={p.id}>
                <ProgramCard program={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section className="border-t border-line bg-brand text-on-brand">
        <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl font-bold sm:text-3xl">Belum yakin layanan yang cocok?</p>
            <p className="mt-1 opacity-85">Ceritakan kebutuhanmu, kami bantu arahkan.</p>
          </div>
          <Link href="/kontak#pesan" className="inline-flex items-center justify-center border border-on-brand px-5 py-3 font-medium transition-colors hover:bg-on-brand hover:text-brand">
            Kirim pesan
          </Link>
        </Container>
      </section>
    </>
  )
}
