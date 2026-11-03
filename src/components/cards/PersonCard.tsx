import type { CabinetMember } from '@/lib/data'
import { POSITION_LABEL, pad } from '@/lib/format'
import { Img } from '../ui/Img'

type Props = {
  member: CabinetMember
  /** Penomoran editorial "Vol. n / total". Kosongkan untuk kartu polos. */
  index?: number
  total?: number
  className?: string
}

/** Kartu orang. Gaya final (editorial a la referensi) dipasang di sini tanpa menyentuh halaman. */
export function PersonCard({ member, index, total, className = '' }: Props) {
  return (
    <figure className={`w-44 shrink-0 sm:w-52 ${className}`}>
      <Img media={member.photo} label={member.person.name} className="aspect-[3/4] w-full rounded-card" />
      <figcaption className="mt-3">
        {index !== undefined && total !== undefined && (
          <p className="font-mono text-[0.7rem] tracking-widest text-ink-muted">
            VOL. {pad(index)} / {pad(total)}
          </p>
        )}
        <p className="font-display font-semibold leading-tight">{member.person.name}</p>
        <p className="text-sm text-ink-muted">{POSITION_LABEL[member.position] ?? member.position}</p>
      </figcaption>
    </figure>
  )
}
