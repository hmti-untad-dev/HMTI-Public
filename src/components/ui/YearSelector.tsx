import Link from 'next/link'

type Props = {
  years: number[]
  current?: number | null
  /** Pola URL, mis. (y) => `/kepengurusan?periode=${y}`. */
  hrefFor: (year: number) => string
  label?: string
}

/** Pemilih tahun/periode berbasis link (tanpa JS, bisa dibagikan lewat URL). */
export function YearSelector({ years, current, hrefFor, label = 'Periode' }: Props) {
  if (years.length === 0) return null
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-ink-muted">{label}</span>
      {years.map((year) => (
        <Link
          key={year}
          href={hrefFor(year)}
          aria-current={year === current ? 'page' : undefined}
          className={`rounded-control border px-3 py-1 text-sm ${
            year === current ? 'border-brand bg-brand text-white' : 'border-line hover:border-brand'
          }`}
        >
          {year}
        </Link>
      ))}
    </nav>
  )
}
