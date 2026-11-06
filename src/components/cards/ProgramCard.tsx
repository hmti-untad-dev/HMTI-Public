import Link from '@/components/ui/AppLink'

import { mediaOf } from '@/lib/data'
import type { Program } from '@/payload-types'
import { Img } from '../ui/Img'

export function ProgramCard({ program }: { program: Program }) {
  const department = typeof program.department === 'object' ? program.department : null
  return (
    <Link href={`/kegiatan/${program.slug}`} className="group block" data-tilt>
      <div className="cv-frame">
        <Img media={mediaOf(program.cover)} label={program.name} className="aspect-[3/4] w-full" />
      </div>
      <p className="mt-3 font-display font-semibold group-hover:text-link">{program.shortName || program.name}</p>
      {department && <p className="text-xs text-ink-muted">{department.name}</p>}
    </Link>
  )
}
