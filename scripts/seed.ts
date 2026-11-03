/**
 * Seed data pengembangan. Struktur (departemen, jabatan, visi/misi, kontak) mengikuti dokumen MUBES 2026
 * (SOP bab I, GBHO 2025, AD/ART). Nama orang, foto, berita, prestasi, testimoni masih DUMMY.
 * Jalankan: npm run seed   (aman diulang: berhenti bila periode 2026 sudah ada)
 *
 * Pengelompokan departemen (internal = diawasi Ketua I, eksternal = diawasi Ketua II) sudah dikonfirmasi pengurus.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })

const existing = await payload.find({ collection: 'periods', where: { year: { equals: 2026 } }, limit: 1 })
if (existing.totalDocs > 0) {
  payload.logger.info('Seed dilewati: periode 2026 sudah ada.')
  process.exit(0)
}

// --- Admin pertama (isi lewat env; lihat .env.example) ---
const adminEmail = process.env.SEED_ADMIN_EMAIL
const adminPassword = process.env.SEED_ADMIN_PASSWORD
if (adminEmail && adminPassword) {
  const users = await payload.find({ collection: 'users', where: { email: { equals: adminEmail } }, limit: 1 })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: adminEmail, password: adminPassword, name: 'Admin Seed', roles: ['superadmin'] },
    })
  }
} else {
  payload.logger.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD kosong: user admin tidak dibuat.')
}

// --- Pengaturan situs ---
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    orgName: 'HMTI UNTAD',
    orgFullName: 'Himpunan Mahasiswa Teknik Informatika Universitas Tadulako',
    tagline: 'Wadah mahasiswa Teknologi Informasi Universitas Tadulako untuk berkontribusi secara aktif, partisipatif, dan demokratis.',
    hero: {
      headline: 'Solid, Berintegritas, Sistematis, dan Profesional',
      subheadline: 'Himpunan Mahasiswa Teknik Informatika Universitas Tadulako.',
      ctaLabel: 'Kenali Kami',
      ctaHref: '/tentang',
    },
    about: { anthemTitle: 'Mars HMTI UNTAD' },
    contact: { email: 'hmti.untad@gmail.com', address: 'Laboratorium Informatika, Universitas Tadulako' },
    socials: [
      { platform: 'Instagram', url: 'https://www.instagram.com/hmtiuntad/' },
      { platform: 'YouTube', url: 'https://www.youtube.com/@hmtiuntad8514' },
      { platform: 'Facebook', url: 'https://www.facebook.com/hmti.untad' },
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/hmtiuntad/' },
    ],
  },
})

// --- Periode ---
// Visi/misi dari GBHO 2025 (berlaku 2025-2027); ganti per kabinet bila ada visi sendiri.
const VISI = 'Menjadikan HMTI UNTAD sebagai organisasi yang solid, berintegritas, sistematis dan profesional.'
const MISI = [
  'Meningkatkan mutu kualitas akademik dan non-akademik anggota HMTI UNTAD.',
  'Menjalin kerja sama dengan individu maupun instansi yang memiliki visi misi yang sama dengan HMTI UNTAD.',
  'Meningkatkan kepedulian terhadap lingkungan dan pengabdian terhadap masyarakat.',
]

const p2025 = await payload.create({
  collection: 'periods',
  data: { label: 'Kepengurusan 2025', year: 2025, status: 'archived', vision: VISI },
})
const p2026 = await payload.create({
  collection: 'periods',
  data: {
    label: 'Kepengurusan 2026',
    year: 2026,
    
    status: 'active',
    vision: VISI,
    missions: MISI.map((text) => ({ text })),
  },
})

// --- Departemen ---
const deptDefs = [
  { name: 'Kesekretariatan', slug: 'kesekretariatan', group: 'internal', description: 'Memanajemen internal himpunan: menata kantor dan sekretariat, mengelola inventaris, serta mendata peminjaman.' },
  { name: 'Intelektual', slug: 'intelektual', group: 'internal', description: 'Pengembangan sumber daya manusia dan teknologi: kajian, talkshow, seminar keilmuan, dan pengelolaan komunitas himpunan.' },
  { name: 'Kaderisasi', slug: 'kaderisasi', group: 'internal', description: 'Meningkatkan kualitas dan kompetensi kader melalui pendidikan, pelatihan, pembinaan, dan pemantauan kinerja anggota.' },
  { name: 'Humas', slug: 'humas', group: 'eksternal', description: 'Hubungan masyarakat dan platform digital: dokumentasi, advokasi isu, citra himpunan, dan hubungan antar lembaga.' },
  { name: 'Ekonomi Kreatif', slug: 'ekonomi-kreatif', group: 'eksternal', description: 'Perencanaan dan pengelolaan kewirausahaan, usaha kreatif, serta kekayaan intelektual HMTI UNTAD.' },
  { name: 'Riset, Inovasi, dan Karya', slug: 'rinoya', group: 'eksternal', description: 'Pengembangan sumber daya gagasan, riset tren teknologi, inkubasi produk inovatif, dan pendampingan delegasi lomba.' },
] as const
const depts = []
for (const [i, d] of deptDefs.entries()) {
  depts.push(await payload.create({ collection: 'departments', data: { ...d, order: i } }))
}

// --- Anggota & keanggotaan ---
let personNo = 0
const person = (name?: string) => payload.create({ collection: 'people', data: { name: name ?? `Nama Pengurus ${++personNo}` } })

const bphPositions = ['ketua', 'ketua1', 'ketua2', 'sekum', 'bendum'] as const
for (const [i, position] of bphPositions.entries()) {
  const a = await person()
  await payload.create({ collection: 'memberships', data: { person: a.id, period: p2026.id, position, order: i } })
  const b = await person()
  await payload.create({ collection: 'memberships', data: { person: b.id, period: p2025.id, position, order: i } })
}
for (const d of depts) {
  const head = await person()
  await payload.create({ collection: 'memberships', data: { person: head.id, period: p2026.id, department: d.id, position: 'koordinator', order: 0 } })
  for (let k = 1; k <= 4; k++) {
    const m = await person()
    await payload.create({ collection: 'memberships', data: { person: m.id, period: p2026.id, department: d.id, position: 'anggota', order: k } })
  }
}

// --- Program kerja & edisi ---
// Nama program dari dokumen MUBES (struktur 2025/2026); TANGGAL dan STATUS adalah data contoh.
type Seed = { name: string; short?: string; slug: string; dept: string; summary: string; start: string; end?: string; status: 'rencana' | 'berjalan' | 'selesai' | 'ditunda'; featured?: boolean }
const programDefs: Seed[] = [
  { name: 'Informatics Festival', short: 'I-Fest', slug: 'i-fest', dept: 'rinoya', summary: 'Festival teknologi tahunan.', start: '2026-09-26', end: '2026-09-28', status: 'selesai', featured: true },
  { name: 'Pengabdian Masyarakat', short: 'PenMas', slug: 'penmas', dept: 'rinoya', summary: 'Program pengabdian kepada masyarakat.', start: '2026-06-20', end: '2026-06-22', status: 'selesai', featured: true },
  { name: 'Dies Natalis', short: 'Dies', slug: 'dies', dept: 'rinoya', summary: 'Perayaan hari jadi himpunan.', start: '2026-03-14', end: '2026-03-16', status: 'selesai', featured: true },
  { name: 'Interaksi Bulanan Mahasiswa', short: 'IBM', slug: 'ibm', dept: 'intelektual', summary: 'Forum bulanan pengembangan intelektual mahasiswa.', start: '2026-02-15', status: 'selesai', featured: true },
  { name: 'Penalaran Keilmuan', slug: 'penalaran-keilmuan', dept: 'intelektual', summary: 'Kajian keilmuan dan riset bidang teknologi.', start: '2026-04-20', status: 'selesai' },
  { name: 'ALGOMATIK', slug: 'algomatik', dept: 'kaderisasi', summary: 'Proses kaderisasi menuju anggota muda.', start: '2026-05-09', end: '2026-05-11', status: 'selesai' },
  { name: 'Latihan Kepemimpinan', short: 'LK', slug: 'latihan-kepemimpinan', dept: 'kaderisasi', summary: 'Pelatihan kepemimpinan anggota.', start: '2026-08-14', end: '2026-08-16', status: 'selesai' },
  { name: 'Musyawarah Besar', short: 'MUBES', slug: 'mubes', dept: 'kaderisasi', summary: 'Sidang umum anggota: pertanggungjawaban dan pemilihan Ketua Umum.', start: '2026-12-19', end: '2026-12-21', status: 'rencana' },
  { name: 'Mimbar Akbar dan Advokasi', slug: 'mimbar-akbar', dept: 'humas', summary: 'Wadah diskusi dan advokasi isu mahasiswa.', start: '2026-04-05', status: 'selesai' },
  { name: 'Interaksi Sosial Media', short: 'ISM', slug: 'ism', dept: 'humas', summary: 'Pengelolaan konten dan platform digital himpunan.', start: '2026-07-01', end: '2026-12-20', status: 'berjalan' },
  { name: 'PERMIKOMNAS', slug: 'permikomnas', dept: 'humas', summary: 'Keikutsertaan pada forum nasional ilmu komputer.', start: '2026-10-24', status: 'ditunda' },
  { name: 'HMTI Shop', slug: 'hmti-shop', dept: 'ekonomi-kreatif', summary: 'Usaha merchandise himpunan.', start: '2026-10-01', end: '2026-12-31', status: 'berjalan' },
  { name: 'Koperasi', slug: 'koperasi', dept: 'ekonomi-kreatif', summary: 'Koperasi kebutuhan mahasiswa.', start: '2026-11-20', status: 'rencana' },
  { name: 'Pendataan Anggota dan Inventaris', slug: 'pendataan', dept: 'kesekretariatan', summary: 'Pendataan anggota dan inventaris himpunan.', start: '2026-12-05', status: 'rencana' },
]
for (const [i, def] of programDefs.entries()) {
  const department = depts.find((d) => d.slug === def.dept)
  const program = await payload.create({
    collection: 'programs',
    data: { name: def.name, shortName: def.short, slug: def.slug, summary: def.summary, department: department?.id, featured: Boolean(def.featured), order: i },
  })
  await payload.create({
    collection: 'editions',
    data: {
      title: `${def.name} 2026`,
      program: program.id,
      period: p2026.id,
      status: def.status,
      startDate: `${def.start}T00:00:00.000+08:00`,
      endDate: def.end ? `${def.end}T00:00:00.000+08:00` : undefined,
      location: 'Lokasi (contoh)',
    },
  })
}

// --- Konten ---
for (const [i, a] of [
  { title: 'Juara 1 Lomba Contoh', rank: 'Juara 1', level: 'nasional', team: 'Tim Contoh', year: 2026 },
  { title: 'Finalis Kompetisi Contoh', rank: 'Finalis', level: 'regional', team: 'Tim Contoh B', year: 2026 },
  { title: 'Juara 2 Hackathon Contoh', rank: 'Juara 2', level: 'kampus', team: 'Tim Contoh C', year: 2025 },
].entries()) {
  await payload.create({ collection: 'achievements', data: { ...a, featured: i < 3 } as never })
}

for (const t of [
  { authorName: 'Alumni Contoh', authorRole: 'Alumni 2020', quote: 'Testimoni placeholder tentang pengalaman di himpunan.' },
  { authorName: 'Mitra Contoh', authorRole: 'Mitra', quote: 'Testimoni placeholder dari mitra kerja sama.' },
  { authorName: 'Anggota Contoh', authorRole: 'Anggota 2024', quote: 'Testimoni placeholder dari anggota aktif.' },
]) {
  await payload.create({ collection: 'testimonials', data: t })
}

// Berita contoh: tersebar sepanjang tahun agar heatmap terlihat nyata. SEMUA DUMMY.
const newsTitles = ['Pembukaan Kabinet 2026', 'Hasil Rapat Kerja', 'Pendaftaran Dies Natalis Dibuka', 'Pengumuman IBM Bulan Ini', 'Dokumentasi Kegiatan', 'Open Recruitment Komunitas', 'Pengumuman Lomba', 'Laporan Pengabdian', 'Info Peminjaman Inventaris']
const newsDays = ['01-12', '01-28', '02-10', '02-13', '02-15', '03-02', '03-10', '03-14', '03-15', '03-16', '03-30', '04-05', '04-06', '04-21', '05-08', '05-09', '05-10', '05-11', '05-25', '06-18', '06-20', '06-21', '06-22', '07-03', '07-27', '08-12', '08-14', '08-15', '08-16', '08-31', '09-14', '09-24', '09-26', '09-27', '09-28', '10-05', '10-19', '10-30', '11-02']
for (const [i, d] of newsDays.entries()) {
  await payload.create({
    collection: 'articles',
    data: {
      title: `${newsTitles[i % newsTitles.length]} (contoh ${i + 1})`,
      slug: `berita-contoh-${i + 1}`,
      category: i % 7 === 3 ? 'pengumuman' : 'berita',
      excerpt: 'Ringkasan berita contoh untuk keperluan tampilan.',
      publishedAt: `2026-${d}T09:00:00.000+08:00`,
      author: 'Tim Humas',
      _status: 'published',
    },
  })
}

for (const [i, a] of [
  { title: 'Dokumentasi I-Fest 2026', year: 2026, bestOfYear: true },
  { title: 'Dokumentasi PenMas 2026', year: 2026, bestOfYear: true },
  { title: 'Dokumentasi Dies Natalis 2026', year: 2026, bestOfYear: false },
  { title: 'Dokumentasi IBM 2026', year: 2026, bestOfYear: false },
  { title: 'Dokumentasi Kegiatan 2025', year: 2025, bestOfYear: true },
].entries()) {
  await payload.create({ collection: 'albums', data: { ...a, slug: `album-contoh-${i + 1}` } })
}

for (const [i, f] of [
  { question: 'Siapa yang bisa menjadi anggota HMTI UNTAD?', answer: 'Mahasiswa program studi S1 Teknik Informatika Universitas Tadulako yang telah mengikuti Pengenalan HMTI UNTAD secara resmi menjadi anggota pasif. Setelah melewati proses ALGOMATIK, menjadi anggota muda.' },
  { question: 'Bagaimana cara meminjam atau menyewa inventaris?', answer: 'Ajukan lewat halaman Layanan. Anggota yang terdaftar di ALGOMATIK tidak dikenai biaya sewa. Pihak eksternal wajib membawa surat resmi, menyertakan foto KTP/KTM, membayar DP 50%, dan menandatangani lembar perjanjian. Keterlambatan pengembalian dikenai denda.' },
  { question: 'Bagaimana cara mengajukan kerja sama atau media partner?', answer: 'Ajukan lewat layanan Kerja Sama atau Media Partner di halaman Layanan, lengkap dengan surat resmi dari instansi atau organisasi Anda.' },
  { question: 'Di mana sekretariat HMTI UNTAD?', answer: 'Di Laboratorium Informatika, Universitas Tadulako. Email: hmti.untad@gmail.com.' },
].entries()) {
  await payload.create({ collection: 'faqs', data: { ...f, order: i } })
}

const serviceDefs = [
  { name: 'Peminjaman Inventaris', slug: 'peminjaman-inventaris', group: 'organisasi', summary: 'Pinjam atau sewa perlengkapan himpunan (dikelola Kesekretariatan).' },
  { name: 'Penyuratan', slug: 'penyuratan', group: 'organisasi', summary: 'Permohonan surat resmi.' },
  { name: 'Media Partner', slug: 'media-partner', group: 'organisasi', summary: 'Ajukan media partner kegiatan.' },
  { name: 'Kerja Sama', slug: 'kerja-sama', group: 'organisasi', summary: 'Ajukan kerja sama dengan himpunan.' },
  { name: 'Jasa Website', slug: 'jasa-website', group: 'bisnis', summary: 'Pembuatan website.' },
  { name: 'Konsultasi', slug: 'konsultasi', group: 'bisnis', summary: 'Konsultasi teknologi.' },
  { name: 'Service Hardware', slug: 'service-hardware', group: 'bisnis', summary: 'Perbaikan perangkat keras.' },
  { name: 'Jasa Design', slug: 'jasa-design', group: 'bisnis', summary: 'Desain grafis dan UI.' },
] as const
for (const [i, s] of serviceDefs.entries()) {
  await payload.create({
    collection: 'services',
    data: {
      ...s,
      order: i,
      active: true,
      formFields: [{ name: 'keperluan', label: 'Keperluan', type: 'textarea', required: true }],
    },
  })
}

payload.logger.info('Seed selesai.')
process.exit(0)
