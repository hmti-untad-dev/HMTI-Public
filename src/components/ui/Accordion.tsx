'use client'

import { type ReactNode, useId, useState } from 'react'

export type AccordionItem = {
  id: string
  title: string
  /** Ringkasan di sebelah judul yang tetap terlihat saat tertutup. */
  meta?: ReactNode
  content: ReactNode
}

type Props = {
  items: AccordionItem[]
  /** Item yang terbuka saat pertama dimuat. */
  defaultOpen?: string[]
  /** true: beberapa item boleh terbuka bersamaan. */
  multiple?: boolean
  className?: string
}

/**
 * Akordion berbaris (tanpa kartu): garis pemisah tegas, penanda +/−, tinggi membuka mulus lewat
 * grid-template-rows (kelas .faq-body). Isi yang tertutup diberi `inert` supaya tautan di dalamnya
 * tidak bisa difokus. Gerak otomatis mati bila pengguna memilih gerak dikurangi (lihat globals.css).
 */
export function Accordion({ items, defaultOpen = [], multiple = false, className = '' }: Props) {
  const base = useId().replace(/:/g, '')
  const [open, setOpen] = useState<string[]>(defaultOpen)

  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : multiple ? [...cur, id] : [id]))

  return (
    <ul className={`border-t border-line ${className}`}>
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        const panel = `${base}-${item.id}`
        return (
          <li key={item.id} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => toggle(item.id)}
                className="flex min-h-16 w-full items-center gap-4 py-4 text-left transition-colors hover:text-link"
              >
                <span className="font-display text-lg font-semibold sm:text-xl">{item.title}</span>
                {item.meta && <span className="ml-auto hidden min-w-0 flex-1 text-sm font-normal text-ink-muted sm:block">{item.meta}</span>}
                <span
                  aria-hidden="true"
                  className={`relative ml-auto size-5 shrink-0 text-ink ${item.meta ? 'sm:ml-0' : ''}`}
                >
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ${isOpen ? 'scale-y-0' : 'scale-y-100'}`} />
                </span>
              </button>
            </h3>
            <div id={panel} role="region" aria-labelledby={undefined} data-open={isOpen} className="faq-body" inert={!isOpen}>
              <div>
                <div className="pb-6 pt-1">{item.content}</div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
