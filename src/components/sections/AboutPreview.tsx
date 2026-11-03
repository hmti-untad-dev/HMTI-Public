import Link from 'next/link'

import { getActivePeriod, getSiteSettings, mediaOf } from '@/lib/data'
import { Img } from '../ui/Img'
import { Section } from '../ui/Section'

const TOPICS = [
  { href: '/tentang#sejarah', label: 'Sejarah' },
  { href: '/tentang#visi', label: 'Visi' },
  { href: '/tentang#misi', label: 'Misi' },
  { href: '/tentang#lagu', label: 'Lagu' },
]

export async function AboutPreview() {
  const [settings, period] = await Promise.all([getSiteSettings(), getActivePeriod()])
  return (
    <Section eyebrow="Tentang" title="Tentang Kami" action={{ href: '/tentang', label: 'Selengkapnya' }}>
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="max-w-2xl text-ink-muted">
            {period?.vision || settings.tagline || 'Ringkasan visi himpunan akan tampil di sini.'}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TOPICS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="block rounded-control border border-brand px-4 py-2 text-center text-sm font-medium text-brand hover:bg-brand-soft"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Img media={mediaOf(settings.logo)} label="LOGO" className="size-44 rounded-card" />
      </div>
    </Section>
  )
}
