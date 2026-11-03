'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { NavGroup } from '@/lib/nav'

/**
 * Menu desktop: buka dengan hover (jeda tutup singkat), fokus keyboard, atau klik (layar sentuh).
 * Esc menutup dan mengembalikan fokus. Efek sapuan dither ada di CSS (.dither).
 */
export function NavMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const root = useRef<HTMLElement>(null)

  const hold = (i: number) => {
    window.clearTimeout(timer.current)
    setOpen(i)
  }
  const release = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(null), 140)
  }

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <nav
      ref={root}
      aria-label="Menu utama"
      className="hidden items-stretch divide-x divide-line border-l border-line lg:flex"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open !== null) {
          setOpen(null)
          ;(document.activeElement as HTMLElement | null)?.blur()
        }
      }}
    >
      {groups.map((g, i) => {
        const hasMenu = Boolean(g.items && g.items.length > 1)
        const isOpen = open === i
        const wide = (g.items?.length ?? 0) > 7
        return (
          <div
            key={g.label}
            className="relative flex"
            onMouseEnter={() => hasMenu && hold(i)}
            onMouseLeave={release}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null)
            }}
          >
            <Link
              href={g.href}
              aria-haspopup={hasMenu ? 'menu' : undefined}
              aria-expanded={hasMenu ? isOpen : undefined}
              data-open={isOpen}
              onFocus={() => hasMenu && hold(i)}
              onClick={() => setOpen(null)}
              className="dither inline-flex items-center gap-1.5 px-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink-muted hover:text-ink aria-expanded:text-ink"
            >
              {g.label}
              {hasMenu && (
                <svg viewBox="0 0 10 6" className={`size-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="m1 1 4 4 4-4" />
                </svg>
              )}
            </Link>

            {hasMenu && (
              <div
                role="menu"
                aria-label={g.label}
                data-open={isOpen}
                className={`absolute left-[-1px] top-full z-50 transition-[opacity,transform,visibility] duration-200 ${
                  isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                }`}
              >
                <ul
                  className={`grid gap-px border border-line bg-line shadow-xl ${wide ? 'w-[30rem] grid-cols-2 [&>li:last-child:nth-child(odd)]:col-span-2' : 'w-64'}`}
                >
                  {g.items!.map((item) => (
                    <li key={item.href + item.label} className="bg-surface-raised">
                      <Link
                        href={item.href}
                        role="menuitem"
                        tabIndex={isOpen ? 0 : -1}
                        {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={() => setOpen(null)}
                        className="dither flex min-h-11 items-center justify-between gap-3 px-4 py-2.5 text-sm text-ink"
                      >
                        <span>{item.label}</span>
                        {item.external && (
                          <svg viewBox="0 0 12 12" className="size-3 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                            <path d="M4 2h6v6M10 2 3 9" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
