import { getActivePeriod, getCabinet, getSiteSettings } from '@/lib/data'
import { MOTTO } from '@/content/tentang'
import { type MottoLine, PixelMotto, type Tone } from '../hero/PixelMotto'
import { TechOrbit } from '../hero/TechOrbit'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { MembershipStats } from '../hero/MembershipStats'

/**
 * Susun jargon menjadi baris bergaya kode: kata pendamping pendek (We, A, the, …) abu berongga, kata utama
 * berwarna teks, dan kata terakhir biru. Jargon bawaan dipecah We Make / A Better / Future.
 */
const SMALL = new Set(['we', 'a', 'an', 'the', 'to', 'of', 'and', 'kami', 'yang', 'dan'])
function toLines(motto: string): MottoLine[] {
  const words = motto.trim().split(/\s+/)
  const tone = (wd: string, last: boolean): Tone => (last ? 'link' : SMALL.has(wd.toLowerCase()) ? 'dim' : 'ink')
  const rows = words.length === 5 ? [words.slice(0, 2), words.slice(2, 4), words.slice(4)] : (() => {
    const per = Math.ceil(words.length / 3)
    const out: string[][] = []
    for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per))
    return out
  })()
  return rows.map((row, r) => ({ words: row.map((wd, k) => ({ text: wd, tone: tone(wd, r === rows.length - 1 && k === row.length - 1) })) }))
}

/**
 * Hero beranda: jargon HMTI sebagai tipografi piksel interaktif (PixelMotto) dan konstelasi bidang IT (TechOrbit),
 * lalu "HMTI dalam angka" (MembershipStats: data per angkatan dari content/keanggotaan.ts + pengurus aktif dari CMS).
 */
export async function Hero() {
  const [settings, period] = await Promise.all([getSiteSettings(), getActivePeriod()])
  const cabinet = await getCabinet(period)
  const motto = settings.motto || MOTTO
  return (
    <section className="hero relative overflow-hidden border-b border-line bg-surface-alt">
      <Container className="grid gap-10 pb-10 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center [&>*]:min-w-0">
        <div data-enter>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-link">
            {settings.orgName || 'HMTI UNTAD'}
            {period?.cabinetName && ` · ${period.cabinetName}`}
            {period && ` · Periode ${period.year}`}
          </p>
          <PixelMotto lines={toLines(motto)} className="mt-5" />
          <p className="mt-7 max-w-xl text-lg text-ink-muted">{settings.hero?.subheadline || settings.tagline || settings.orgFullName}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={settings.hero?.ctaHref || '/tentang'}>{settings.hero?.ctaLabel || 'Kenali Kami'}</Button>
            <Button href="/layanan" variant="outline">
              Ajukan Layanan
            </Button>
          </div>
        </div>
        <div className="hero-panel">
          <TechOrbit />
        </div>
      </Container>

      <Container className="pb-14">
        <MembershipStats pengurus={cabinet.total} pengurusYear={period?.year} chart={false} />
      </Container>
    </section>
  )
}
