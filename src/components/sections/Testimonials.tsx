import { getTestimonials } from '@/lib/data'
import { Empty } from '../ui/Empty'

export async function Testimonials() {
  const items = await getTestimonials()
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">Testimoni</h2>
      {items.length === 0 ? (
        <Empty>Belum ada testimoni.</Empty>
      ) : (
        <ul className="space-y-4">
          {items.slice(0, 3).map((t) => (
            <li key={t.id}>
              <blockquote className="rounded-card border border-line bg-surface p-4">
                <p className="text-sm">“{t.quote}”</p>
                <footer className="mt-3 text-xs text-ink-muted">
                  <span className="font-semibold text-ink">{t.authorName}</span>
                  {t.authorRole && ` · ${t.authorRole}`}
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
