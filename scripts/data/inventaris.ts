/**
 * Impor inventaris dari seed-assets/inventaris.json (hasil konversi "List Barang Inventaris HMTI UNTAD.xlsx";
 * tidak ikut repo karena memuat tempat penyimpanan dan alamat). Berkas ini hanya berisi aturan klasifikasi:
 * kategori untuk barang "Pengadaan Kepengurusan 2025", ikon, publik/internal, dan bisa dipinjam.
 * Semua bisa diubah per barang lewat admin setelah diimpor.
 */
import fs from 'node:fs'
import path from 'node:path'

import type { InventoryIconName } from '../../src/lib/inventory'

type Row = { sheet: string; category: string; name: string; qty: string; storage: string; area: string }

const has = (name: string, ...words: string[]) => words.some((w) => name.includes(w))

/** Barang di lembar "Pengadaan Kepengurusan 2025" tidak berkategori; tetapkan dari jenisnya. */
function categoryOf(row: Row) {
  if (row.category !== 'Pengadaan Kepengurusan 2025') return row.category
  const n = row.name.toLowerCase()
  if (has(n, 'slayer', 'pin hmti', 'baju')) return 'Atribut'
  if (has(n, 'kabel', 'terminal', 'esp32', 'steker', 'mic', 'wi-fi')) return 'Alat Elektronik'
  if (has(n, 'roller printer')) return 'ATK'
  if (has(n, 'keset', 'terplak')) return 'Alat Rumah Tangga'
  return 'Barang Inventaris'
}

const ICON_RULES: [string[], InventoryIconName][] = [
  [['lpj'], 'file-text'],
  [['arsip'], 'archive'],
  [['baju', 'pdh', 'jaket', 'slayer', 'gantungan baju'], 'shirt'],
  [['pin hmti', 'pin majalah', 'gantungan id', 'maskot', 'mahkota'], 'sticker'],
  [['bendera', 'umbul', 'stand banner', 'spanduk'], 'flag'],
  [['bingkai', 'pajangan', 'struktur organisasi', 'madding', 'wallpaper', 'background studio', 'cermin'], 'image'],
  [['piala'], 'trophy'],
  [['jam dinding'], 'clock'],
  [['tas camera'], 'briefcase'],
  [['papan tulis'], 'teach'],
  [['layar infokus', 'mimbar'], 'presentation'],
  [['infokus'], 'projector'],
  [['memory card'], 'memory-stick'],
  [['tripod camera', 'kamera', 'lensa'], 'camera'],
  [['lighting', 'lampu sorot'], 'spotlight'],
  [['lampu', 'vitting'], 'lightbulb'],
  [['printer', 'catridge', 'tinta print'], 'printer'],
  [['keyboard'], 'keyboard'],
  [['mouse'], 'mouse'],
  [['monitor'], 'monitor'],
  [['cpu'], 'computer'],
  [['hardisk'], 'database'],
  [['baterai'], 'battery'],
  [['esp32'], 'circuit-board'],
  [['router', 'wi-fi', 'orbit'], 'wifi'],
  [['radio', 'ht dan'], 'radio'],
  [['alat podcast', 'mic'], 'mic'],
  [['sound system', 'toa'], 'volume-3'],
  [['adaptor', 'stavol', 'terminal', 'steker', 'cok cabang', 'kabel power', 'kipas'], 'plug'],
  [['kabel hdmi', 'kabel vga', 'sambungan hdmi', 'kabel printer', 'kabel'], 'usb'],
  [['palu sidang', 'perkakas', 'baut', 'meteran', 'gergaji', 'kawat', 'gembok'], 'tools'],
  [['pemotong kertas', 'gunting', 'cutter'], 'scissors'],
  [['kertas', 'notebook', 'buku tamu'], 'notebook'],
  [['map plastik', 'rak dokumen'], 'folder'],
  [['cap', 'tinta', 'spidol', 'hekter', 'pelubang', 'isolasi', 'suntik', 'penggaris', 'pulpen'], 'pencil'],
  [['papan catur'], 'chess'],
  [['bola', 'pompa balon', 'lilin'], 'balloon'],
  [['gelas', 'termos', 'galon', 'dispenser', 'pompa air', 'tutup gelas'], 'mug'],
  [['sapu', 'skop', 'kemoceng', 'kain pel', 'kain lap', 'tempat sampah'], 'trash'],
  [['karpet', 'kain hitam', 'terpal', 'terplak', 'gorden'], 'tent'],
  [['kontrakan'], 'map-pin-home'],
  [['google drive'], 'cloud'],
  [['meja', 'lemari', 'rak '], 'sofa'],
]
const CATEGORY_ICON: Record<string, InventoryIconName> = {
  'Arsip & Dokumentasi': 'archive',
  Atribut: 'shirt',
  Furniture: 'sofa',
  'Barang Inventaris': 'package',
  ATK: 'pencil',
  'Alat Elektronik': 'plug',
  'Alat Rumah Tangga': 'coffee',
  'Tanah dan Bangunan': 'map-pin-home',
}

/** Perlengkapan acara di kategori rumah tangga yang boleh tampil dan dipinjam. */
const EVENT_HOUSEHOLD = ['piring rotan', 'tempat makanan prasmanan', 'karpet', 'kain hitam', 'terpal', 'terplak']
/** Barang yang bisa dipinjam organisasi/pihak luar (bisa diubah di admin). */
const LOANABLE = [
  'layar infokus', 'infokus', 'sound system besar', 'kaki sound system', 'toa', 'ht dan cas ht', 'mic', 'alat podcast',
  'lighting dan tripod lighting', 'lampu sorot', 'tripod camera', 'stand banner', 'umbul-umbul', 'tiang bendera',
  'mimbar', 'background studio', 'kabel hdmi', 'kabel vga', 'sambungan hdmi to vga', 'cok cabang', 'steker kombinasi',
  'kabel power', 'papan tulis', ...EVENT_HOUSEHOLD,
]
/** Selalu internal: alamat, penyimpanan daring, keamanan sekretariat, jaringan. */
const ALWAYS_INTERNAL = ['kontrakan', 'google drive', 'gembok', 'wi-fi', 'router', 'orbit', 'spanduk bekas', 'kawat', 'karet']
const INTERNAL_CATEGORIES = ['Arsip & Dokumentasi', 'ATK', 'Tanah dan Bangunan']

function locationOf(row: Row) {
  if (row.sheet === 'Sekretariat Dalam') return 'sekretariat-dalam'
  if (row.sheet === 'Sekretariat Luar') return 'sekretariat-luar'
  return row.area.includes('Dalam & Luar') ? 'dalam-luar' : 'lainnya'
}

/** "12 Buah" -> 12 Buah; "1/5 Karung" -> 0.2 + teks khusus. */
function quantityOf(qty: string) {
  const m = qty.match(/^([\d.,/]+)\s*(.*)$/)
  if (!m) return { stock: 1, unit: qty, quantityText: qty }
  const [num, unit] = [m[1], m[2] || 'Buah']
  if (num.includes('/')) {
    const [a, b] = num.split('/').map(Number)
    return { stock: Number((a / b).toFixed(2)), unit, quantityText: qty }
  }
  return { stock: Number(num.replace(',', '.')), unit }
}

export function classify(row: Row) {
  const n = row.name.toLowerCase()
  const category = categoryOf(row)
  const icon = ICON_RULES.find(([words]) => has(n, ...words))?.[1] ?? CATEGORY_ICON[category] ?? 'package'
  const eventItem = has(n, ...EVENT_HOUSEHOLD)
  const internal =
    INTERNAL_CATEGORIES.includes(category) || has(n, ...ALWAYS_INTERNAL) || (category === 'Alat Rumah Tangga' && !eventItem) || /^cap |bantalan cap|tinta cap/.test(n)
  const loanable = !internal && LOANABLE.some((w) => n.startsWith(w))
  return {
    name: row.name,
    category,
    ...quantityOf(row.qty),
    location: locationOf(row),
    storage: row.storage,
    icon,
    visibility: internal ? 'internal' : 'publik',
    loanable,
    procurement2025: row.category === 'Pengadaan Kepengurusan 2025',
  }
}

/** Mengimpor seluruh baris. Dilewati bila koleksi sudah berisi atau berkas sumber tidak ada. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importInventory(payload: any) {
  const file = path.join(process.cwd(), 'seed-assets', 'inventaris.json')
  if (!fs.existsSync(file)) return 0
  if ((await payload.count({ collection: 'inventory' })).totalDocs > 0) return 0
  const rows: Row[] = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const row of rows) await payload.create({ collection: 'inventory', data: classify(row) })
  return rows.length
}
