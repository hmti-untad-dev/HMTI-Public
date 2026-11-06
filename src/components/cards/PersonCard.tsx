import type { CabinetMember } from '@/lib/data'
import { pad, roleLabel } from '@/lib/format'
import { PixelPortrait } from '../ui/PixelPortrait'

type Props = {
  member: CabinetMember
  /** Penomoran editorial "Vol. n / total". Kosongkan untuk kartu polos. */
  index?: number
  total?: number
  className?: string
  /** Ukuran kecil yang mengisi sel grid (dipakai koordinator di beranda), bukan lebar tetap. */
  compact?: boolean
}

/** Kartu orang. Gaya final (editorial a la referensi) dipasang di sini tanpa menyentuh halaman. */
export function PersonCard({ member, index, total, className = '', compact = false }: Props) {
  return (
    <figure className={`${compact ? 'w-full min-w-0' : 'w-44 shrink-0 sm:w-52'} ${className}`} data-tilt>
      <div className={`relative w-full ${member.poster ? 'aspect-[4/5]' : 'aspect-[3/4]'} overflow-hidden border border-line bg-scrim`}>
        <PixelPortrait
          src={member.photo?.sizes?.card?.url ?? member.photo?.url ?? null}
          name={member.person.name}
          tag={index !== undefined ? `ID_${pad(index)}` : 'ID'}
        />
      </div>
      <figcaption className="mt-3">
        {index !== undefined && total !== undefined && (
          <p className="font-mono text-[0.7rem] tracking-widest text-ink-muted">
            VOL. {pad(index)} / {pad(total)}
          </p>
        )}
        <p className={`font-display font-semibold leading-tight ${compact ? 'text-sm' : ''}`}>{member.person.name}</p>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-ink-muted`}>{roleLabel(member.position, member.department?.name)}</p>
      </figcaption>
    </figure>
  )
}
