import { getAchievements, mediaOf } from '@/lib/data'
import { Empty } from '../ui/Empty'
import { Img } from '../ui/Img'

export async function Achievements() {
  const items = await getAchievements({ featured: true })
  const [lead, ...rest] = items
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">Prestasi</h2>
      {!lead ? (
        <Empty>Belum ada prestasi unggulan.</Empty>
      ) : (
        <div className="space-y-4">
          <article className="overflow-hidden rounded-card border border-line">
            <Img media={mediaOf(lead.proof)} label={lead.title} className="aspect-video w-full" />
            <div className="p-4">
              <p className="text-xs uppercase tracking-wider text-link">
                {[lead.rank, lead.level, lead.year].filter(Boolean).join(' · ')}
              </p>
              <h3 className="font-display text-lg font-semibold">{lead.title}</h3>
              {lead.team && <p className="text-sm text-ink-muted">{lead.team}</p>}
            </div>
          </article>
          <ul className="divide-y divide-line rounded-card border border-line">
            {rest.slice(0, 3).map((a) => (
              <li key={a.id} className="p-3 text-sm">
                <span className="font-medium">{a.title}</span>{' '}
                <span className="text-ink-muted">— {[a.rank, a.year].filter(Boolean).join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
