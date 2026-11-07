/**
 * Susunan kepengurusan 2025 dari SK "Susunan Kepengurusan HMTI FT UNTAD Tahun 2025" (Palu, 30 Januari 2025),
 * melengkapi Dewan Eksekutif dan koordinator yang sudah ada dari poster. Nomor stambuk (NIM) sengaja tidak dimasukkan.
 * Nama departemen 2025 di SK: Kewirausahaan = ekonomi-kreatif, Kreativitas = rinoya (nama baru 2026).
 * Ejaan nama mengikuti SK, kecuali yang sudah ada di data 2026 (mis. "Muh. Zulhajir AR") agar orangnya sama.
 */
export const PEMBINA_2025 = ['Ir. Sri Khaerawati Nur, S.Kom., M.Kom.', "Fizar Syafa'at, S.Kom., M.Kom."]

export const BPO_2025 = ['Muammar Arianto', 'Syarif Mohammad Syakur', 'Rahmat Rifki R', "Rif'an Abdillah"]

export const ANGGOTA_2025: Record<string, string[]> = {
  kesekretariatan: ['Siti Aminah', 'Hajera', 'Sofia Qatrunnada', 'Rizka Filardi Toliz', 'Sofia Ismar Hermansyah', 'Vicram L', 'Nurul Zaskia'],
  kaderisasi: ['Muh. Zulhajir AR', 'Aulia Fitri Hanifah', 'Andi Muhammad Ihzan', 'Aura Ghina Mandary'],
  intelektual: ['Rut Naomi Ester Sitompul', 'Ahmad Mujahid', 'Muhammad Khaechal Fadillah', 'La Ode Mualim Khalifah Khair', 'Rasya Rahmat Syaban', 'Avav Abdillah Sam'],
  'ekonomi-kreatif': ['Safana Annisa Salsabilah', 'Novita Fadilah Datuamas', 'Yuyun Aulia Afrianty', 'Siti Nurvatika', 'Adriani Maulidya', 'Nisma', 'Aril S'],
  humas: ['Andi Muhammad Fayyadh', 'Dede Al Fandi', 'Anugrah Ahmad Wiranto', 'Nur Khalizah', 'Aura Nayla Djokja'],
  rinoya: [
    'Nakita Semesta',
    'Angelina Febriani Madesen',
    'Syavira Humayra',
    'Muh Azhar Rasyid',
    'Jessica Andryani',
    'Yunus Syahrul Mubarok',
    'Juan P Kuganda',
    'Felicia Claudia Pandelaki',
  ],
}

/**
 * Menambahkan pembina, BPO, dan anggota departemen 2025. `person(name)` mengembalikan orang yang sudah ada (dicari
 * berdasarkan nama) atau membuat baru. Aman diulang: dilewati bila periode 2025 sudah punya anggota.
 */
export async function addKepengurusan2025(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  periodId: number,
  departments: { id: number; slug: string }[],
  person: (name: string) => Promise<{ id: number }>,
) {
  const existing = await payload.count({ collection: 'memberships', where: { period: { equals: periodId }, position: { equals: 'anggota' } } })
  if (existing.totalDocs > 0) return 0
  let n = 0
  const add = async (name: string, position: string, order: number, department?: number) => {
    const who = await person(name)
    await payload.create({ collection: 'memberships', data: { person: who.id, period: periodId, position, order, ...(department ? { department } : {}) } })
    n++
  }
  for (const [i, name] of PEMBINA_2025.entries()) await add(name, 'pembina', i)
  for (const [i, name] of BPO_2025.entries()) await add(name, 'pengawas', i)
  for (const [slug, names] of Object.entries(ANGGOTA_2025)) {
    const dept = departments.find((d) => d.slug === slug)
    for (const [i, name] of names.entries()) await add(name, 'anggota', i, dept?.id)
  }
  return n
}
