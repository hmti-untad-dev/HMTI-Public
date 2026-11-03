'use client'

import { useId, useState } from 'react'

type Item = { id: number | string; question: string; answer: string }

/**
 * FAQ bergaya percakapan: pertanyaan sebagai gelembung gelap bertanda +/−, jawaban sebagai gelembung terang
 * yang membuka mulus. Satu jawaban terbuka pada satu waktu. Tanpa JS tetap terbaca (jawaban tersembunyi
 * hanya lewat CSS, tetap ada di DOM untuk pembaca layar lewat aria-controls).
 */
export function FaqChat({ items }: { items: Item[] }) {
  const base = useId().replace(/:/g, '')
  const [open, setOpen] = useState<Item['id'] | null>(items[0]?.id ?? null)

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">Pertanyaan yang sering diajukan</p>
      <ul className="space-y-3">
        {items.map((item) => {
          const isOpen = open === item.id
          const panel = `${base}-${item.id}`
          return (
            <li key={item.id}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className={`min-h-11 max-w-[88%] rounded-2xl rounded-bl-md px-4 py-3 text-left text-[0.95rem] transition-colors duration-200 ${
                    isOpen ? 'bg-brand text-on-brand' : 'bg-surface-raised text-ink hover:bg-brand-soft/50'
                  } border border-line`}
                >
                  {item.question}
                </button>
                <span
                  aria-hidden="true"
                  className="relative size-4 shrink-0 text-ink-muted"
                >
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ${
                      isOpen ? 'scale-y-0' : 'scale-y-100'
                    }`}
                  />
                </span>
              </div>

              <div id={panel} role="region" data-open={isOpen} className="faq-body" aria-hidden={!isOpen}>
                <div>
                  <p className="ml-6 mt-2 max-w-[92%] rounded-2xl rounded-tl-md bg-ink px-4 py-3 text-[0.95rem] text-surface sm:ml-16">
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
