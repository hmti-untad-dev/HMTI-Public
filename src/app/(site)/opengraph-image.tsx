import { OG_ALT, OG_SIZE, renderOgCard } from '@/lib/og-card'

// Gambar pratinjau saat tautan situs dibagikan (WhatsApp, Telegram, Discord, dsb.). Dipakai semua halaman
// yang tidak punya gambar sendiri (mis. berita dengan foto sampul).
export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderOgCard()
}
