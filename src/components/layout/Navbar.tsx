import Link from 'next/link'

import { LOGIN_HREF, NAV_ITEMS } from '@/lib/nav'
import { Container } from '../ui/Container'

/** Tanpa JS: menu mobile memakai <details>. */
export function Navbar({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-bold text-brand">
          {orgName}
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-control px-3 py-2 text-sm hover:bg-brand-soft">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={LOGIN_HREF}
            className="rounded-control border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft"
          >
            Login
          </Link>
          <details className="relative lg:hidden">
            <summary className="cursor-pointer list-none rounded-control border border-line px-3 py-1.5 text-sm">
              Menu
            </summary>
            <nav
              aria-label="Menu utama (mobile)"
              className="absolute right-0 mt-2 flex w-56 flex-col rounded-card border border-line bg-surface p-2 shadow-lg"
            >
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-control px-3 py-2 text-sm hover:bg-brand-soft">
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
