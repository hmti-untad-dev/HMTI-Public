import type { Media } from '@/payload-types'

type Props = {
  media?: Media | null
  label?: string
  className?: string
}

/**
 * Gambar dari Media, atau kotak placeholder (gaya wireframe) bila belum ada.
 * Pakai <img> biasa agar skeleton tidak butuh konfigurasi domain next/image;
 * ganti ke next/image saat storage media final.
 */
export function Img({ media, label, className = '' }: Props) {
  const src = media?.sizes?.card?.url ?? media?.url
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={media?.alt ?? label ?? ''} className={`object-cover ${className}`} loading="lazy" />
  }
  return (
    <div
      role="img"
      aria-label={label ?? 'Gambar belum tersedia'}
      className={`flex items-center justify-center border border-dashed border-brand/50 bg-brand-soft/40 text-xs text-ink-muted ${className}`}
    >
      {label ?? 'gambar'}
    </div>
  )
}
