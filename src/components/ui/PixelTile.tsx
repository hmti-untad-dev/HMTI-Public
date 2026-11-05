/**
 * Pengganti gambar yang belum diunggah: ubin tipografi dengan pola piksel 5x5 simetris (identicon) yang dihitung
 * dari judul, jadi tiap item punya "wajah" sendiri dan selaras dengan motif piksel situs. Murni server, tanpa JS.
 */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export function PixelTile({ title, label, tag, className = '' }: { title: string; label?: string; tag?: string; className?: string }) {
  const h = hash(title)
  // 5 kolom, dicerminkan dari 3 kolom kiri; 15 bit pertama hash menentukan sel menyala.
  const cells: { x: number; y: number; o: number }[] = []
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 3; x++) {
      const bit = (h >> (y * 3 + x)) & 1
      if (!bit) continue
      const o = 0.45 + (((h >> ((y + x) % 16)) & 3) / 3) * 0.55
      cells.push({ x, y, o })
      if (x < 2) cells.push({ x: 4 - x, y, o })
    }
  return (
    <div role="img" aria-label={label ?? title} className={`relative flex flex-col justify-between overflow-hidden border border-line bg-surface-raised p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted">{tag ?? 'foto menyusul'}</span>
        <svg viewBox="0 0 5 5" className="size-10 shrink-0 sm:size-12" aria-hidden="true">
          {cells.map((c, i) => (
            <rect key={i} x={c.x + 0.06} y={c.y + 0.06} width="0.88" height="0.88" fill="var(--link)" opacity={c.o} />
          ))}
        </svg>
      </div>
      <p className="line-clamp-3 font-display text-xl font-bold leading-tight sm:text-2xl">{title}</p>
    </div>
  )
}
