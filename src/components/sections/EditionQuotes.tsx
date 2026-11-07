import { QuoteCard } from '@/components/ui/QuoteCard'
import type { Testimonial } from '@/payload-types'

/**
 * Kutipan tamu dan mitra sebuah kegiatan (halaman program dan edisi). Kutipan pertama tampil besar selebar penuh,
 * sisanya berdampingan.
 */
export function EditionQuotes({ quotes, title = 'Kata mereka' }: { quotes: Testimonial[]; title?: string }) {
  if (quotes.length === 0) return null
  const [first, ...rest] = quotes
  return (
    <section aria-labelledby="kata-mereka" className="border-t border-line py-12">
      <h2 id="kata-mereka" className="font-display text-2xl font-bold">
        {title}
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <QuoteCard quote={first} size="lg" className="md:col-span-2" />
        {rest.map((q) => (
          <QuoteCard key={q.id} quote={q} />
        ))}
      </div>
    </section>
  )
}
