import Link from '@/components/ui/AppLink'
import type { Testimonial } from '@/payload-types'

// Tanda kutip pembuka dari piksel (gaya jargon piksel di hero). Dua glyph 3x4 dengan jarak satu kolom.
const MARK = ['..1.' + '..1', '.1..' + '.1.', '11..' + '11.', '11..' + '11.']
const CELLS = MARK.flatMap((row, y) => [...row].map((v, x) => (v === '1' ? { x, y } : null)).filter((c): c is { x: number; y: number } => c !== null))

function PixelMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 16" className={className} aria-hidden="true" focusable="false">
      {CELLS.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x * 4} y={c.y * 4} width="3.4" height="3.4" fill="currentColor" />
      ))}
    </svg>
  )
}

/** Inisial dari nama tanpa gelar: "Dr. Yuli Asmi Rahman, S.T." -> "YA", "M. Sadly Lesnusa" -> "SL". */
function initials(name: string) {
  const words = name
    .split(',')[0]
    .split(/\s+/)
    .filter((w) => w.length > 1 && !w.endsWith('.'))
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^(www|palu)\./, '')
  } catch {
    return url
  }
}

type Props = {
  quote: Testimonial
  size?: 'lg' | 'md'
  /** Tautan ke kegiatan asal kutipan, mis. { href: '/kegiatan/i-fest/2025', label: 'Informatics Festival 2025' }. */
  context?: { href: string; label: string } | null
  className?: string
}

/**
 * Kartu kutipan tamu/testimoni: tanda kutip piksel, teks kutipan, lalu identitas (monogram inisial karena foto
 * jarang tersedia, nama, peran, dan sumber berita bila ada). `lg` untuk kutipan utama, `md` untuk lainnya.
 */
export function QuoteCard({ quote: q, size = 'md', context, className = '' }: Props) {
  const lg = size === 'lg'
  return (
    <figure className={`group flex h-full flex-col border border-line bg-surface ${lg ? 'p-6 sm:p-8' : 'p-5 sm:p-6'} ${className}`}>
      <PixelMark className={`${lg ? 'w-12' : 'w-9'} text-link transition-transform duration-300 group-hover:-translate-y-0.5`} />
      <blockquote
        className={`mt-4 flex-1 text-pretty ${lg ? 'font-display text-xl font-medium leading-snug sm:text-2xl' : 'text-[0.95rem] leading-relaxed text-ink'}`}
      >
        {q.quote}
      </blockquote>
      <figcaption className={`flex items-center gap-3 border-t border-line ${lg ? 'mt-6 pt-5' : 'mt-5 pt-4'}`}>
        <span
          aria-hidden="true"
          className={`grid shrink-0 place-items-center bg-brand-soft font-mono font-bold text-link ${lg ? 'size-12 text-sm' : 'size-10 text-xs'}`}
        >
          {initials(q.authorName)}
        </span>
        <span className="min-w-0 text-sm">
          <span className="block font-semibold text-ink">{q.authorName}</span>
          {q.authorRole && <span className="block text-ink-muted">{q.authorRole}</span>}
          {(q.sourceUrl || context) && (
            <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
              {context && (
                <Link href={context.href} className="text-link hover:underline">
                  {context.label} →
                </Link>
              )}
              {q.sourceUrl && (
                <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-link hover:underline">
                  Sumber: {host(q.sourceUrl)} ↗
                </a>
              )}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  )
}
