// Zona WITA (Palu): tanggal kegiatan diisi +08:00; tanpa ini server ber-zona UTC bisa menampilkan hari sebelumnya.
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' })

export function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}

/** Rentang tanggal ringkas: "11–12 November 2025", "28 Oktober – 2 November 2025", atau satu tanggal saja. */
export function formatDateRange(start?: string | null, end?: string | null) {
  const a = formatDate(start)
  const b = formatDate(end)
  if (!a || !b || a === b) return a || b
  const parts = (v: string) => Object.fromEntries(dateFormatter.formatToParts(new Date(v)).map((p) => [p.type, p.value]))
  const s = parts(start!)
  const e = parts(end!)
  if (s.year === e.year && s.month === e.month) return `${s.day}–${b}`
  return `${a} – ${b}`
}

/** 3 -> "03", untuk penomoran gaya editorial (mis. "Vol. 03 / 75"). */
export function pad(n: number, width = 2) {
  return String(n).padStart(width, '0')
}

export const POSITION_LABEL: Record<string, string> = {
  ketua: 'Ketua Umum',
  ketua1: 'Ketua I',
  ketua2: 'Ketua II',
  sekum: 'Sekretaris Umum',
  bendum: 'Bendahara Umum',
  koordinator: 'Koordinator Departemen',
  anggota: 'Anggota',
  pembina: 'Pembina',
  pengawas: 'Badan Pengawas Organisasi',
}

/** Jabatan untuk tampilan: koordinator disebut bersama departemennya, mis. "Koordinator Humas". */
export function roleLabel(position: string, departmentName?: string | null) {
  if (position === 'koordinator' && departmentName) return `Koordinator ${departmentName}`
  return POSITION_LABEL[position] ?? position
}
