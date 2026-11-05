import { getActivePeriod, getSiteSettings } from '@/lib/data'
import { MISI_GBHO, MARS_JUDUL, MARS_PENCIPTA, SIAPA_KAMI, VISI_GBHO } from '@/content/tentang'
import { Accordion } from '../ui/Accordion'
import { Button } from '../ui/Button'
import { LAB_OBJECTS, VisionScanner } from '../ui/VisionScanner'
import { Section } from '../ui/Section'

/** Tombol menuju bagian lengkap di halaman Tentang. */
function Detail({ href }: { href: string }) {
  return (
    <Button href={href} variant="outline" className="mt-4 rounded-none">
      Lihat detail
    </Button>
  )
}

/**
 * Ringkasan Tentang untuk beranda: tersusun ke bawah, tiap topik berupa baris akordion berisi penjelasan singkat
 * dan tombol ke bagian lengkapnya di /tentang. Teks diambil dari src/content/tentang.ts supaya satu sumber.
 */
export async function AboutPreview() {
  const [settings, period] = await Promise.all([getSiteSettings(), getActivePeriod()])
  const visi = period?.vision || VISI_GBHO
  return (
    <Section id="tentang" eyebrow="Tentang" title="Tentang Kami">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center [&>*]:min-w-0">
        <div className="max-w-3xl">
          <span className="shine">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hmti-logo.webp" alt="Lambang HMTI UNTAD" width={80} height={80} className="block size-20 rounded-full" />
          </span>
          <p className="mt-5 text-lg text-ink">{SIAPA_KAMI[0]}</p>
          {settings.tagline && <p className="mt-2 text-ink-muted">{settings.tagline}</p>}
        </div>
        <VisionScanner
          src="/brand/lab-informatika.webp"
          alt="Gedung Laboratorium Informatika Universitas Tadulako, tempat sekretariat HMTI UNTAD"
          width={611}
          height={348}
          objects={LAB_OBJECTS}
          caption="Laboratorium Informatika, sekretariat HMTI UNTAD"
        />
      </div>

      <Accordion
        className="mt-10"
        defaultOpen={['visi-misi']}
        items={[
          {
            id: 'visi-misi',
            title: 'Visi dan Misi',
            content: (
              <div className="max-w-3xl text-ink-muted">
                <p>
                  <span className="font-medium text-ink">Visi.</span> {visi}
                </p>
                <p className="mt-3 font-medium text-ink">Misi.</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  {MISI_GBHO.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ol>
                <Detail href="/tentang#visi-misi" />
              </div>
            ),
          },
          {
            id: 'sejarah',
            title: 'Sejarah',
            content: (
              <div className="max-w-3xl text-ink-muted">
                <p>
                  HMTI UNTAD lahir dari inisiatif mahasiswa Teknik Informatika angkatan 2012 dan resmi dibentuk melalui SK Rektor Universitas Tadulako pada 30 Mei 2014. Setahun kemudian, 30 Mei 2015, himpunan merayakan Dies Natalis pertamanya.
                </p>
                <Detail href="/tentang#sejarah" />
              </div>
            ),
          },
          {
            id: 'lambang',
            title: 'Makna Lambang',
            content: (
              <div className="max-w-3xl text-ink-muted">
                <p>Delapan unsur pada lambang punya arti masing-masing: lingkaran, warna hitam, biru, putih, USB, sinyal, open source, dan satelit. Klik bagiannya untuk menjelajah.</p>
                <Detail href="/tentang#lambang" />
              </div>
            ),
          },
          {
            id: 'mars',
            title: MARS_JUDUL,
            content: (
              <div className="max-w-3xl text-ink-muted">
                <p>Dengarkan mars himpunan lengkap dengan liriknya. {MARS_PENCIPTA}.</p>
                <Detail href="/tentang#mars" />
              </div>
            ),
          },
        ]}
      />

      <div className="mt-8">
        <Button href="/tentang" className="rounded-none">
          Tentang HMTI selengkapnya
        </Button>
      </div>
    </Section>
  )
}
