/** Pilihan kursor situs (Pengaturan Situs → Kursor). Gambar di public/cursors/, dibuat oleh scripts/gen-cursors.mjs. */
export const CURSORS = [
  { value: 'bawaan', label: 'Bawaan', note: 'Kursor biasa dari sistem pengunjung.' },
  { value: 'piksel', label: 'Panah Piksel', note: 'Panah dan tangan piksel biru HMTI, senada dengan motif piksel situs.' },
  { value: 'teemo', label: 'Teemo', note: 'Panah hitam berekor kucing; jejak kaki saat menunjuk tautan.' },
  { value: 'allblue', label: 'Inti Bintang', note: 'Bintang inti Kabinet All Blue; berada dalam cincin pusaran saat menunjuk tautan.' },
] as const
export type CursorName = (typeof CURSORS)[number]['value']
export const isCursor = (v: unknown): v is CursorName => CURSORS.some((c) => c.value === v)
