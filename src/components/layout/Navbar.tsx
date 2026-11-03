import Link from 'next/link'

import { LOGIN_HREF, NAV_GROUPS, type NavGroup } from '@/lib/nav'
import { Container } from '../ui/Container'
import { NavMenu } from './NavMenu'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  orgName: string
  departments: { name: string; slug: string }[]
  archivedYears: number[]
}

/** Menyusun menu dari konfigurasi statis + data CMS (departemen dan arsip periode). */
function buildGroups({ departments, archivedYears }: Pick<Props, 'departments' | 'archivedYears'>): NavGroup[] {
  return NAV_GROUPS.map((g) =>
    g.label !== 'Kepengurusan'
      ? g
      : {
          ...g,
          items: [
            ...(g.items ?? []),
            ...departments.map((d) => ({ href: `/kepengurusan/${d.slug}`, label: d.name })),
            ...archivedYears.map((y) => ({ href: `/kepengurusan?periode=${y}`, label: `Arsip periode ${y}` })),
          ],
        },
  )
}

/** Navigasi desktop = komponen client kecil (NavMenu); menu mobile memakai <details> tanpa JS. */
export function Navbar({ orgName, departments, archivedYears }: Props) {
  const groups = buildGroups({ departments, archivedYears })
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-display text-base font-bold text-ink sm:gap-3 sm:text-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hmti-logo.webp" alt="" width={36} height={36} className="size-9 rounded-full" />
          {orgName}
        </Link>

        <NavMenu groups={groups} />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={LOGIN_HREF}
            className="dither inline-flex h-10 items-center overflow-hidden rounded-control border border-brand px-3 text-sm font-medium text-link"
          >
            Login
          </Link>
          <details className="group relative lg:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-control border border-line px-3 text-sm transition-colors hover:border-brand">
              Menu
            </summary>
            <nav
              aria-label="Menu utama (mobile)"
              className="absolute right-0 mt-2 max-h-[75dvh] w-72 overflow-y-auto rounded-card border border-line bg-surface-raised p-2 shadow-xl"
            >
              <Link href="/" className="block rounded-control px-3 py-2.5 text-sm hover:bg-brand-soft/50">
                Beranda
              </Link>
              {groups.map((g) => (
                <div key={g.label} className="mt-1 border-t border-line pt-1">
                  <Link href={g.href} className="block rounded-control px-3 py-2.5 text-sm font-medium hover:bg-brand-soft/50">
                    {g.label}
                  </Link>
                  {g.items && g.items.length > 1 && (
                    <ul className="mb-1 ml-3 border-l border-line pl-2">
                      {g.items.map((item) => (
                        <li key={item.href + item.label}>
                          <Link
                            href={item.href}
                            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="block rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-brand-soft/50 hover:text-ink"
                          >
                            {item.label}
                            {item.external && ' ↗'}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  )
}
