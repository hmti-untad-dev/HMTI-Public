import { getArticles } from '@/lib/data'
import { ArticleCard } from '../cards/ArticleCard'
import { Empty } from '../ui/Empty'
import { Section } from '../ui/Section'

export async function NewsPreview() {
  const { docs } = await getArticles({ limit: 3 })
  return (
    <Section eyebrow="Kabar terbaru" title="Berita" action={{ href: '/berita', label: 'Semua berita' }}>
      {docs.length === 0 ? (
        <Empty>Belum ada berita.</Empty>
      ) : (
        <ul className="grid gap-6 md:grid-cols-3">
          {docs.map((a) => (
            <li key={a.id}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
