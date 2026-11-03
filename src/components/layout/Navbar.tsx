import Link from 'next/link'

import { LOGIN_HREF, NAV_ITEMS } from '@/lib/nav'
import { Container } from '../ui/Container'
import { ThemeToggle } from './ThemeToggle'

/** Tanpa JS untuk navigasi: menu mobile memakai <details>. Hanya pengalih tema yang client. */
export function Navbar({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-display text-base font-bold text-ink sm:gap-3 sm:text-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hmti-logo.webp" alt="" width={36} height={36} className="size-9 rounded-full" />
          {orgName}
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-brand-soft/50 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={LOGIN_HREF}
            className="rounded-control border border-brand px-3 py-2 text-sm font-medium text-link hover:bg-brand-soft/50"
          >
            Login
          </Link>
          <details className="relative lg:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-control border border-line px-3 text-sm">
              Menu
            </summary>
            <nav
              aria-label="Menu utama (mobile)"
              className="absolute right-0 mt-2 flex w-56 flex-col rounded-card border border-line bg-surface-raised p-2 shadow-lg"
            >
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-control px-3 py-2 text-sm hover:bg-brand-soft/50">
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  )
}
