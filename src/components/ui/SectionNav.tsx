'use client'

import { useEffect, useRef, useState } from 'react'

export type SectionLink = { id: string; label: string }

/**
 * Daftar isi lengket untuk halaman panjang (mis. Tentang). Menandai bagian yang sedang dibaca
 * (IntersectionObserver, tanpa listener gulir), dan di layar sempit bisa digeser ke samping;
 * penanda aktif selalu digeser ke dalam pandangan tanpa ikut menggulir halaman.
 */
export function SectionNav({ items, label = 'Daftar isi' }: { items: SectionLink[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const seen = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting))
        const first = items.find((it) => seen.get(it.id))
        if (first) setActive(first.id)
      },
      { rootMargin: '-120px 0px -55% 0px' },
    )
    items.forEach((it) => {
      const el = document.getElementById(it.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [items])

  useEffect(() => {
    const ul = list.current
    const a = ul?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!ul || !a) return
    const left = a.offsetLeft - ul.clientWidth / 2 + a.offsetWidth / 2
    ul.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [active])

  return (
    <nav aria-label={label} className="sticky top-16 z-30 border-b border-line bg-surface" data-lenis-prevent-horizontal>
      <ul ref={list} className="mx-auto flex max-w-site gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {items.map((it) => {
          const on = it.id === active
          return (
            <li key={it.id} className="shrink-0">
              <a
                href={`#${it.id}`}
                data-id={it.id}
                aria-current={on ? 'location' : undefined}
                className={`block border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                  on ? 'border-brand bg-brand text-on-brand' : 'border-transparent text-ink-muted hover:border-line hover:text-ink'
                }`}
              >
                {it.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
