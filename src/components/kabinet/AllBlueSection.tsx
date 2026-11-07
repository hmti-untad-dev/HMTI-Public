'use client'

import { useState } from 'react'

import { ALL_BLUE, type AllBlueLayer } from '@/content/kabinet'
import { pad } from '@/lib/format'
import { AllBlueMark } from './AllBlueMark'

/**
 * Pengenalan Kabinet All Blue: filosofi nama, lambang yang digambar ulang dari maknanya, dan tiga unsur lambang.
 * Memilih (klik, fokus, atau arahkan tetikus ke) sebuah unsur menyorot lapisan itu di lambang dan meredupkan
 * yang lain; "Utuh" menampilkan semuanya.
 */
export function AllBlueSection() {
  const [picked, setPicked] = useState<AllBlueLayer | null>(null)
  const [hover, setHover] = useState<AllBlueLayer | null>(null)
  const active = hover ?? picked
  const current = ALL_BLUE.elements.find((e) => e.key === active)

  return (
    <section id="all-blue" aria-labelledby="all-blue-title" className="ab-section bg-ocean text-ocean-ink">
      <div className="mx-auto w-full max-w-site px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-ocean-muted">Kabinet {ALL_BLUE.year}</p>
            <h2 id="all-blue-title" className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-7xl">
              {ALL_BLUE.name}
            </h2>
            <div className="mt-6 max-w-[60ch] space-y-4 text-base leading-relaxed text-ocean-ink/85 sm:text-lg">
              {ALL_BLUE.philosophy.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>

          <figure className="relative mx-auto w-full max-w-[34rem]">
            <AllBlueMark active={active} className="aspect-square w-full" />
            <figcaption className="mt-3 min-h-[3lh] text-center text-sm text-ocean-muted" aria-live="polite">
              {current ? current.drawn : 'Empat arus samudra bertemu di satu titik. Pilih unsur di bawah untuk melihat lapisannya.'}
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-ocean-line pt-6">
          <p className="mr-2 font-mono text-xs uppercase tracking-[0.25em] text-ocean-muted">Makna lambang</p>
          <button
            type="button"
            aria-pressed={picked === null}
            onClick={() => setPicked(null)}
            className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${picked === null ? 'border-ocean-glow bg-ocean-glow text-ocean' : 'border-ocean-line hover:border-ocean-glow'}`}
          >
            Utuh
          </button>
        </div>

        <ol className="mt-5 grid gap-px bg-ocean-line md:grid-cols-3">
          {ALL_BLUE.elements.map((e, i) => {
            const on = active === e.key
            return (
              <li key={e.key} className="bg-ocean">
                <button
                  type="button"
                  aria-pressed={picked === e.key}
                  onClick={() => setPicked(picked === e.key ? null : e.key)}
                  onPointerEnter={() => setHover(e.key)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(e.key)}
                  onBlur={() => setHover(null)}
                  className={`ab-card group flex h-full w-full flex-col items-start p-5 text-left transition-colors sm:p-6 ${on ? 'is-on bg-ocean-raised' : 'hover:bg-ocean-raised'}`}
                >
                  <span className="flex w-full items-baseline justify-between gap-3">
                    <span className="font-mono text-sm text-ocean-glow">{pad(i + 1)}</span>
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ocean-muted">{e.alias}</span>
                  </span>
                  <span className="mt-4 font-display text-2xl font-semibold">{e.name}</span>
                  <span className="mt-1 font-medium text-ocean-glow">{e.values}</span>
                  <span className="mt-3 text-sm leading-relaxed text-ocean-ink/80">{e.text}</span>
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {e.refs.map((r) => (
                      <span key={r} className="border border-ocean-line px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ocean-muted">
                        {r}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
