'use client'

import { useMemo, useState } from 'react'

import { pad } from '@/lib/format'
import { PixelPortrait } from '../ui/PixelPortrait'

export type ShowcaseMember = {
  id: number
  name: string
  role: string
  photoUrl: string | null
  instagram: string | null
  /** Foto sudah berupa poster bernama: teks bawaan tidak ditumpuk di atasnya. */
  poster: boolean
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
  const [scan, setScan] = useState(false)

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
    <section className="bg-surface text-ink" aria-label={`Pengurus ${orgName} ${year}`}>
      <div className="mx-auto w-full max-w-site px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between border-b border-line pb-4 font-mono text-xs uppercase tracking-[0.25em]">
          <p>
            <span className="font-bold text-ink">{orgName}</span>
            <span className="ml-3 text-ink-muted">— Pengurus Kabinet {year}</span>
          </p>
          <p className="text-ink-muted">
            Vol. {pad(globalIndex)} / {pad(total)}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-5xl leading-[0.95] sm:text-6xl">
              The <em className="text-link">Faces</em>
              <br />
              Behind {orgName.split(' ')[0]}.
            </h2>

            {/* Poster */}
            <figure className="relative mt-8 aspect-[4/5] overflow-hidden border border-line bg-scrim">
              <PixelPortrait src={current.photoUrl} name={current.name} replayKey={current.id} pinned={scan} />
              {!current.poster && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-scrim/90 via-transparent to-scrim/30" />}
              {!current.poster && (
                <>
                  <p className="pointer-events-none absolute left-9 top-8 font-mono text-xs tracking-widest text-white/85">
                    <span className="text-lg">/ {pad(globalIndex)}</span>
                  </p>
                  <p className="pointer-events-none absolute right-9 top-8 bg-scrim/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-white">
                    {current.role}
                  </p>
                  <figcaption className="pointer-events-none absolute inset-x-9 bottom-8">
                    <p className="font-serif text-4xl italic leading-none text-white sm:text-5xl">{current.name}</p>
                    <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-white/75">{group.title}</p>
                  </figcaption>
                </>
              )}
              <button
                type="button"
                aria-pressed={scan}
                onClick={() => setScan((v) => !v)}
                className={`absolute right-9 border border-white/70 bg-scrim/75 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white hover:bg-scrim ${current.poster ? 'top-8' : 'top-[4.25rem]'}`}
              >
                {scan ? 'Bitmap' : 'ASCII'}
              </button>
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
                      ? 'border-ink bg-ink text-surface'
                      : 'border-line text-ink hover:border-night-muted'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">{group.label}</p>
              <h3 className="mt-2 font-serif text-3xl italic">{group.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{members.length} pengurus</p>
            </div>

            <ol className="mt-6 border-t border-line">
              {members.map((m, i) => {
                const active = i === index
                return (
                  <li key={m.id} className="border-b border-line">
                    <div className={`flex items-center gap-2 transition-colors ${active ? 'bg-ink text-surface' : 'hover:bg-surface-alt'}`}>
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-current={active ? 'true' : undefined}
                        className="flex flex-1 items-center gap-6 px-3 py-4 text-left"
                      >
                        <span className={`w-8 font-serif text-lg italic ${active ? 'text-surface' : 'text-ink-muted'}`}>{pad(i + 1)}</span>
                        <span className="flex-1">
                          <span className={`block text-lg ${active ? 'font-semibold text-surface' : 'text-ink'}`}>{m.name}</span>
                          <span className={`block text-sm ${active ? 'text-surface/80' : 'text-ink-muted'}`}>{m.role}</span>
                        </span>
                        {active && <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.2em] text-surface/80 sm:block">Sedang tampil</span>}
                      </button>
                      {m.instagram && (
                        <a
                          href={instagramUrl(m.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Instagram ${m.name}`}
                          className={`mr-2 flex size-10 items-center justify-center rounded-full border ${active ? 'border-surface/60 text-surface hover:border-surface' : 'border-line text-ink hover:border-ink'}`}
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
                )
              })}
            </ol>

            <div className="mt-auto flex items-center gap-4 pt-8">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Pengurus sebelumnya"
                className="flex size-12 items-center justify-center rounded-full border border-line hover:border-ink"
              >
                ←
              </button>
              <div className="flex flex-1 flex-wrap gap-1" aria-hidden="true">
                {flat.map((m, i) => (
                  <span key={m.id} className={`h-0.5 w-4 ${i + 1 === globalIndex ? 'bg-link' : 'bg-line'}`} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Pengurus berikutnya"
                className="flex size-12 items-center justify-center rounded-full border border-line hover:border-ink"
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
