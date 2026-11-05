const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
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
