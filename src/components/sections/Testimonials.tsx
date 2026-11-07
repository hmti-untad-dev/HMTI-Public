import { QuoteCard } from '@/components/ui/QuoteCard'
import { getTestimonials } from '@/lib/data'
import type { Testimonial } from '@/payload-types'
import { Empty } from '../ui/Empty'

/** Tautan ke edisi kegiatan asal kutipan, bila kutipan ditautkan ke edisi. */
function contextOf(t: Testimonial) {
  const e = typeof t.edition === 'object' ? t.edition : null
  const program = e && typeof e.program === 'object' ? e.program : null
  if (!e || !program) return null
  const year = e.startDate ? new Date(e.startDate).getFullYear() : e.id
  return { href: `/kegiatan/${program.slug}/${year}`, label: e.title }
}

export async function Testimonials() {
  const items = (await getTestimonials()).slice(0, 3)
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">Kata mereka</h2>
      {items.length === 0 ? (
        <Empty>Belum ada testimoni.</Empty>
      ) : (
        <ul className="grid gap-3">
          {items.map((t, i) => (
            <li key={t.id}>
              <QuoteCard quote={t} size={i === 0 ? 'lg' : 'md'} context={contextOf(t)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
