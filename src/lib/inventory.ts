/**
 * Kosakata inventaris yang dipakai bersama oleh koleksi Payload, skrip impor, dan tampilan web.
 * Ikon memakai nama pixelarticons (24x24, gaya piksel senada situs); pemetaannya ke komponen ada di
 * components/ui/InventoryIcon.tsx.
 */
export const INVENTORY_CATEGORIES = [
  'Arsip & Dokumentasi',
  'Atribut',
  'Furniture',
  'Barang Inventaris',
  'ATK',
  'Alat Elektronik',
  'Alat Rumah Tangga',
  'Tanah dan Bangunan',
] as const

export const INVENTORY_LOCATIONS = [
  { value: 'sekretariat-dalam', label: 'Sekretariat Dalam' },
  { value: 'sekretariat-luar', label: 'Sekretariat Luar' },
  { value: 'dalam-luar', label: 'Sekretariat Dalam & Luar' },
  { value: 'lainnya', label: 'Lokasi lain' },
] as const

export const INVENTORY_ICONS = [
  'archive', 'file-text', 'folder', 'notebook', 'pencil', 'scissors', 'clipboard',
  'shirt', 'sticker', 'flag', 'image', 'trophy', 'clock', 'briefcase', 'package', 'box', 'sofa', 'teach', 'presentation',
  'camera', 'video', 'printer', 'projector', 'monitor', 'computer', 'keyboard', 'mouse', 'mic', 'radio', 'volume-3',
  'spotlight', 'lightbulb', 'plug', 'zap', 'usb', 'wifi', 'database', 'memory-stick', 'battery', 'circuit-board',
  'tools', 'tool-case', 'coffee', 'mug', 'trash', 'tent', 'chess', 'balloon', 'lock', 'cloud', 'map-pin-home',
] as const
export type InventoryIconName = (typeof INVENTORY_ICONS)[number]

export const locationLabel = (v?: string | null) => INVENTORY_LOCATIONS.find((l) => l.value === v)?.label ?? 'Lokasi lain'

/** Jumlah untuk tampilan: teks khusus (mis. "1/5 Karung") bila ada, selain itu angka + satuan. */
export const quantityLabel = (item: { stock: number; unit?: string | null; quantityText?: string | null }) =>
  item.quantityText || `${item.stock.toLocaleString('id-ID')} ${item.unit ?? ''}`.trim()

export type PublicItem = {
  id: number
  name: string
  category: string | null
  stock: number
  unit: string | null
  quantityText: string | null
  location: string | null
  icon: string | null
  loanable: boolean
  procurement2025: boolean
}
/** Peminjaman aktif tanpa data peminjam: cukup untuk menghitung jumlah tersedia. */
export type ActiveLoan = { item: number; quantity: number; from: string; to: string }

/** Nomor hari kalender di zona WITA (UTC+8), untuk membandingkan rentang tanggal per hari. */
export const dayOf = (iso: string) => Math.floor((Date.parse(iso) + 8 * 3_600_000) / 86_400_000)
/** "2026-12-01" dari input tanggal -> nomor hari WITA. */
export const dayOfInput = (v: string) => dayOf(`${v}T00:00:00.000+08:00`)
export const today = () => dayOf(new Date().toISOString())

/** Jumlah tersedia untuk rentang hari [from, to] (default: hari ini), dikurangi peminjaman yang bertumpang tindih. */
export function availableQty(item: Pick<PublicItem, 'id' | 'stock'>, loans: ActiveLoan[], from = today(), to = from) {
  const used = loans
    .filter((l) => l.item === item.id && dayOf(l.from) <= to && dayOf(l.to) >= from)
    .reduce((sum, l) => sum + l.quantity, 0)
  return Math.max(0, Math.floor(item.stock) - used)
}
