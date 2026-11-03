import Link from 'next/link'

import type { CabinetMember } from '@/lib/data'
import type { Department } from '@/payload-types'
import { PersonCard } from '../cards/PersonCard'
import { Empty } from '../ui/Empty'

type Props = {
  department: Department
  members: CabinetMember[]
  /** Nomor urut global tiap anggota (untuk penomoran "Vol. n / total"). */
  numbering: Map<number, number>
  total: number
}

/** Satu departemen: nama, deskripsi, carousel anggota. */
export function DepartmentBlock({ department, members, numbering, total }: Props) {
  return (
    <article className="rounded-card border border-line p-5">
      <header className="mb-4">
        <h3 className="font-display text-xl font-semibold">
          <Link href={`/kepengurusan/${department.slug}`} className="hover:text-brand">
            {department.name}
          </Link>
        </h3>
        {department.description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{department.description}</p>}
      </header>
      {members.length === 0 ? (
        <Empty>Belum ada anggota.</Empty>
      ) : (
        <div className="snap-row">
          {members.map((m) => (
            <PersonCard key={m.id} member={m} index={numbering.get(m.id)} total={total} />
          ))}
        </div>
      )}
    </article>
  )
}
