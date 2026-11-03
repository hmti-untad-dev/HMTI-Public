'use client'

import { useMemo, useState } from 'react'

import { pad } from '@/lib/format'

export type ShowcaseMember = {
  id: number
  name: string
  role: string
  photoUrl: string | null
  instagram: string | null
}

export type ShowcaseGroup = {
  key: string
  label: string
  title: string
  members: ShowcaseMember[]
}

type Props = {
  orgName: string
  year: number
  groups: ShowcaseGroup[]
}

function instagramUrl(handle: string) {
  return handle.startsWith('http') ? handle : `https://instagram.com/${handle.replace(/^@/, '')}`
}

/**
 * Tampilan kepengurusan gaya editorial gelap: tab grup, poster besar di kiri,
 * daftar nama di kanan, penomoran "VOL. n / total". Semua data datang dari CMS lewat props.
 * Ubah warna lewat token `--color-night-*` di src/styles/tokens.css.
 */
export function CabinetShowcase({ orgName, year, groups }: Props) {
  const [groupKey, setGroupKey] = useState(groups[0]?.key)
  const [index, setIndex] = useState(0)

  const flat = useMemo(() => groups.flatMap((g) => g.members.map((m) => ({ ...m, groupKey: g.key }))), [groups])
  const total = flat.length
  const group = groups.find((g) => g.key === groupKey) ?? groups[0]
  const members = group?.members ?? []
  const current = members[Math.min(index, members.length - 1)]
  const globalIndex = current ? flat.findIndex((m) => m.id === current.id) + 1 : 0

  function selectGroup(key: string) {
    setGroupKey(key)
    setIndex(0)
  }

  function step(delta: number) {
    if (total === 0 || !current) return
    const next = (globalIndex - 1 + delta + total) % total
    const target = flat[next]
    setGroupKey(target.groupKey)
    const targetGroup = groups.find((g) => g.key === target.groupKey)
    setIndex(targetGroup ? targetGroup.members.findIndex((m) => m.id === target.id) : 0)
  }

  if (!group || !current) return null

  return (
    <section className="bg-night text-night-ink" aria-label={`Pengurus ${orgName} ${year}`}>
      <div className="mx-auto w-full max-w-site px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between border-b border-night-line pb-4 font-mono text-xs uppercase tracking-[0.25em]">
          <p>
            <span className="font-bold text-night-ink">{orgName}</span>
            <span className="ml-3 text-night-muted">— Pengurus Kabinet {year}</span>
          </p>
          <p className="text-night-muted">
            Vol. {pad(globalIndex)} / {pad(total)}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-5xl leading-[0.95] sm:text-6xl">
              The <em className="text-night-accent">Faces</em>
              <br />
              Behind {orgName.split(' ')[0]}.
            </h2>

            {/* Poster */}
            <figure className="relative mt-8 aspect-[4/5] overflow-hidden rounded-lg border border-night-line bg-night-raised">
              {current.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.photoUrl} alt={current.name} className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-night-muted">
                  foto {current.name}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-night/30" />
              <p className="absolute left-5 top-5 font-mono text-xs tracking-widest text-night-ink/80">
                <span className="text-lg">/ {pad(globalIndex)}</span>
              </p>
              <p className="absolute right-5 top-5 rounded bg-night/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.25em]">
                {current.role}
              </p>
              <figcaption className="absolute inset-x-5 bottom-5">
                <p className="font-serif text-4xl italic leading-none sm:text-5xl">{current.name}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-night-ink/70">{group.title}</p>
              </figcaption>
            </figure>
          </div>

          <div className="flex flex-col">
            <div role="tablist" aria-label="Kelompok pengurus" className="flex flex-wrap gap-2 lg:justify-end">
              {groups.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  role="tab"
                  aria-selected={g.key === group.key}
                  onClick={() => selectGroup(g.key)}
                  className={`border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                    g.key === group.key
                      ? 'border-night-ink bg-night-ink text-night'
                      : 'border-night-line text-night-ink hover:border-night-muted'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-night-line pt-6">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-night-muted">{group.label}</p>
              <h3 className="mt-2 font-serif text-3xl italic">{group.title}</h3>
              <p className="mt-1 text-sm text-night-muted">{members.length} pengurus</p>
            </div>

            <ol className="mt-6 border-t border-night-line">
              {members.map((m, i) => (
                <li key={m.id} className="border-b border-night-line">
                  <div
                    className={`flex items-center gap-4 py-4 pr-2 ${i === index ? 'text-night-ink' : 'text-night-muted'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-current={i === index ? 'true' : undefined}
                      className="flex flex-1 items-center gap-6 text-left"
                    >
                      <span className="w-8 font-serif text-lg italic">{pad(i + 1)}</span>
                      <span>
                        <span className="block text-lg text-night-ink">{m.name}</span>
                        <span className="block text-sm text-night-muted">{m.role}</span>
                      </span>
                    </button>
                    {m.instagram && (
                      <a
                        href={instagramUrl(m.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Instagram ${m.name}`}
                        className="flex size-10 items-center justify-center rounded-full border border-night-line text-night-ink hover:border-night-ink"
                      >
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                        </svg>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-auto flex items-center gap-4 pt-8">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Pengurus sebelumnya"
                className="flex size-12 items-center justify-center rounded-full border border-night-line hover:border-night-ink"
              >
                ←
              </button>
              <div className="flex flex-1 flex-wrap gap-1" aria-hidden="true">
                {flat.map((m, i) => (
                  <span key={m.id} className={`h-0.5 w-4 ${i + 1 === globalIndex ? 'bg-amber-200' : 'bg-night-line'}`} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Pengurus berikutnya"
                className="flex size-12 items-center justify-center rounded-full border border-night-line hover:border-night-ink"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
