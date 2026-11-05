import type { Media } from '@/payload-types'
import { PixelTile } from './PixelTile'

type Props = {
  media?: Media | null
  label?: string
  /** Teks besar di ubin pengganti bila judul sudah tampil di bawah kartu (mis. kategori). Default: label. */
  placeholder?: string
  className?: string
}

/**
 * Gambar dari Media, atau ubin piksel (PixelTile) bila belum ada.
 * Pakai <img> biasa agar skeleton tidak butuh konfigurasi domain next/image;
 * ganti ke next/image saat storage media final.
 */
export function Img({ media, label, placeholder, className = '' }: Props) {
  const src = media?.sizes?.card?.url ?? media?.url
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={media?.alt ?? label ?? ''} className={`skeleton object-cover ${className}`} loading="lazy" />
  }
  return <PixelTile title={placeholder ?? label ?? 'Gambar belum tersedia'} label={label} className={className} />
}
