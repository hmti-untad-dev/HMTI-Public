import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { NAV_ITEMS } from '@/lib/nav'
import { Container } from '../ui/Container'

export function Footer({ settings }: { settings: SiteSetting }) {
  const { contact, socials } = settings
  return (
    <footer className="mt-auto border-t border-line bg-surface-alt text-ink">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hmti-logo.webp" alt="" width={48} height={48} className="size-12 rounded-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/untad-logo.webp" alt="Universitas Tadulako" width={48} height={48} className="size-12 object-contain" />
          </div>
          <p className="mt-4 font-display text-xl font-bold">{settings.orgName}</p>
          <p className="mt-1 text-sm text-ink-muted">{settings.orgFullName}</p>
        </div>

        <nav aria-label="Tautan footer">
          <p className="mb-3 text-sm font-semibold">Jelajahi</p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-ink-muted">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm text-ink-muted">
          <p className="mb-3 font-semibold text-ink">Kontak</p>
          {contact?.address && <p>{contact.address}</p>}
          {contact?.email && (
            <p className="mt-1">
              <a href={`mailto:${contact.email}`} className="hover:text-ink">
                {contact.email}
              </a>
            </p>
          )}
          {contact?.phone && <p className="mt-1">{contact.phone}</p>}
          {socials && socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center rounded-control border border-line px-3 text-ink hover:border-brand"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
      <div className="border-t border-line py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} {settings.orgName}. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  )
}
