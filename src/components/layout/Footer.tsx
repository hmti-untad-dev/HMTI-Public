import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { NAV_ITEMS } from '@/lib/nav'
import { Container } from '../ui/Container'

export function Footer({ settings }: { settings: SiteSetting }) {
  const { contact, socials } = settings
  return (
    <footer className="mt-auto bg-ink text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">{settings.orgName}</p>
          <p className="mt-2 text-sm text-white/70">{settings.orgFullName}</p>
        </div>

        <nav aria-label="Tautan footer">
          <p className="mb-3 text-sm font-semibold">Jelajahi</p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm text-white/70">
          <p className="mb-3 font-semibold text-white">Kontak</p>
          {contact?.address && <p>{contact.address}</p>}
          {contact?.email && <p className="mt-1">{contact.email}</p>}
          {contact?.phone && <p className="mt-1">{contact.phone}</p>}
          {socials && socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {settings.orgName}. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  )
}
