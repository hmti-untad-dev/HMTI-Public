import { getChairs, getQuotes, mediaOf } from '@/lib/data'
import { Section } from '../ui/Section'
import { ChairSlider } from './ChairSlider'
import { QuoteRotator } from './QuoteRotator'

/**
 * Jejak Kepemimpinan: slider Ketua Umum dari data keanggotaan (jabatan "ketua" tiap periode) dan kutipan tokoh
 * (Testimoni berjenis "Kutipan tokoh"). Dipakai di beranda dan halaman Tentang.
 */
export async function LegacySection({ id = 'jejak', tone }: { id?: string; tone?: 'default' | 'alt' }) {
  const [chairs, quotes] = await Promise.all([getChairs(), getQuotes()])
  if (chairs.length === 0 && quotes.length === 0) return null
  // Satu slot per periode sejak 2014 sampai periode terbaru; periode yang datanya belum diisi tampil sebagai slot kosong.
  const lastYear = Math.max(2026, ...chairs.map((c) => c.year))
  const slots = Array.from({ length: lastYear - 2014 + 1 }, (_, i) => 2014 + i).map((year) => {
    const c = chairs.find((x) => x.year === year)
    return c
      ? { id: c.id, name: c.name, year, cabinetName: c.cabinetName, photoUrl: c.photo?.sizes?.card?.url ?? c.photo?.url ?? null, poster: c.poster, current: c.current, empty: false }
      : { id: -year, name: year === 2014 ? 'Ketua Umum pertama' : 'Nama menyusul', year, cabinetName: null, photoUrl: null, poster: false, current: false, empty: true }
  })
  return (
    <Section id={id} tone={tone} eyebrow="Sejak 2014" title="Jejak Kepemimpinan">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start [&>*]:min-w-0">
        <div>
          <ChairSlider chairs={slots} />
        </div>
        <QuoteRotator
          quotes={quotes.map((q) => {
            const photo = mediaOf(q.photo)
            return { id: q.id, quote: q.quote, name: q.authorName, role: q.authorRole ?? null, photoUrl: photo?.sizes?.thumbnail?.url ?? photo?.url ?? null }
          })}
        />
      </div>
    </Section>
  )
}
