import { getFaqs } from '@/lib/data'
import { Empty } from '../ui/Empty'
import { Section } from '../ui/Section'

/** Akordeon tanpa JS memakai <details>. */
export async function FaqSection() {
  const faqs = await getFaqs()
  return (
    <Section tone="alt" eyebrow="Bantuan" title="FAQ">
      {faqs.length === 0 ? (
        <Empty>Belum ada pertanyaan.</Empty>
      ) : (
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f) => (
            <details key={f.id} className="group rounded-card border border-line bg-surface p-4">
              <summary className="cursor-pointer list-none font-medium">{f.question}</summary>
              <p className="mt-3 text-sm text-ink-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </Section>
  )
}
