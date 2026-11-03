import { getActivePeriod, getCabinet, getPrograms, getSiteSettings, mediaOf } from '@/lib/data'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Img } from '../ui/Img'

/** Hero + 4 kotak statistik (menggantikan 4 kotak kecil wireframe yang belum punya fungsi). */
export async function Hero() {
  const [settings, period, programs] = await Promise.all([getSiteSettings(), getActivePeriod(), getPrograms()])
  const cabinet = await getCabinet(period)

  const stats = [
    { label: 'Periode', value: period ? String(period.year) : '—' },
    { label: 'Departemen', value: String(cabinet.departments.length) },
    { label: 'Pengurus aktif', value: String(cabinet.total) },
    { label: 'Program kerja', value: String(programs.length) },
  ]

  return (
    <section className="border-b border-line bg-surface-alt">
      <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          {period?.cabinetName && (
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              {period.cabinetName} · Periode {period.year}
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {settings.hero?.headline || settings.orgFullName}
          </h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            {settings.hero?.subheadline || settings.tagline || 'Wadah aspirasi dan kreativitas mahasiswa.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={settings.hero?.ctaHref || '/tentang'}>{settings.hero?.ctaLabel || 'Kenali Kami'}</Button>
            <Button href="/layanan" variant="outline">
              Ajukan Layanan
            </Button>
          </div>
        </div>
        <Img media={mediaOf(settings.hero?.image)} label="hero" className="aspect-video w-full rounded-card" />
      </Container>

      <Container className="pb-12">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-card border border-line bg-surface p-4">
              <dd className="font-display text-3xl font-bold text-brand">{s.value}</dd>
              <dt className="text-sm text-ink-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
