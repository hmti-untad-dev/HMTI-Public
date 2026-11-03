import { getFaqs } from '@/lib/data'
import { Empty } from '../ui/Empty'
import { Section } from '../ui/Section'
import { FaqChat } from './FaqChat'

export async function FaqSection() {
  const faqs = await getFaqs()
  return (
    <Section tone="alt" title="FAQ">
      {faqs.length === 0 ? <Empty>Belum ada pertanyaan.</Empty> : <FaqChat items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />}
    </Section>
  )
}
