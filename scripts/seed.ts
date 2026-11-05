/**
 * Seed data pengembangan. Struktur (departemen, jabatan, visi/misi, kontak) mengikuti dokumen MUBES 2026
 * (SOP bab I, GBHO 2025, AD/ART). Nama orang, foto, berita, prestasi, testimoni masih DUMMY.
 * Jalankan: npm run seed   (aman diulang: berhenti bila periode 2026 sudah ada)
 *
 * Pengelompokan departemen (internal = diawasi Ketua I, eksternal = diawasi Ketua II) sudah dikonfirmasi pengurus.
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import sharp from 'sharp'

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
    motto: 'We Make A Better Future',
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
    cabinetName: 'Kabinet All Blue',
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
  { name: 'Ekonomi Kreatif', slug: 'ekonomi-kreatif', group: 'eksternal', formerName: 'Kewirausahaan', description: 'Perencanaan dan pengelolaan kewirausahaan, usaha kreatif, serta kekayaan intelektual HMTI UNTAD.' },
  { name: 'Riset, Inovasi, dan Karya', slug: 'rinoya', group: 'eksternal', formerName: 'Kreatifitas', description: 'Pengembangan sumber daya gagasan, riset tren teknologi, inkubasi produk inovatif, dan pendampingan delegasi lomba.' },
] as const
const depts = []
for (const [i, d] of deptDefs.entries()) {
  depts.push(await payload.create({ collection: 'departments', data: { ...d, order: i } }))
}

// --- Anggota & keanggotaan ---
// Satu orang bisa menjabat di beberapa periode, jadi data orang dipakai ulang berdasarkan nama.
const peopleByName = new Map<string, { id: number }>()
const person = async (name: string) => {
  const key = name.trim().toLowerCase()
  const known = peopleByName.get(key)
  if (known) return known
  const created = await payload.create({ collection: 'people', data: { name } })
  peopleByName.set(key, created)
  return created
}

// --- Pengurus 2026: data ASLI dari SK Rektor UNTAD No. 1541/UN28/HK.02/2026 (nomor stambuk sengaja tidak dimasukkan) ---
const dewan2026 = [
  { name: 'Muh. Zulhajir AR', position: 'ketua' },
  { name: 'Hajera', position: 'ketua1' },
  { name: 'Bagus Pria Utama', position: 'ketua2' },
  { name: 'Sifa Sahira', position: 'sekum' },
  { name: 'Aulia Fitri Hanifah', position: 'bendum' },
] as const
for (const [i, d] of dewan2026.entries()) {
  const who = await person(d.name)
  await payload.create({ collection: 'memberships', data: { person: who.id, period: p2026.id, position: d.position, order: i } })
}
for (const [i, name] of ['Deni Luvi Jayanto, M.Kom.', 'Ir. Sri Khaerawati Nur, S.Kom., M.Kom.'].entries()) {
  const who = await person(name)
  await payload.create({ collection: 'memberships', data: { person: who.id, period: p2026.id, position: 'pembina', order: i } })
}
for (const [i, name] of ['Ahmad Afil', 'Muh Afdal Maedja', 'Hidayatul Fatwa', 'Fahruddin A. Lebe'].entries()) {
  const who = await person(name)
  await payload.create({ collection: 'memberships', data: { person: who.id, period: p2026.id, position: 'pengawas', order: i } })
}

// --- Dewan Eksekutif 2025: data ASLI dari poster pengurus (foto di seed-assets/, tidak ikut repo) ---
// Poster hanya menulis "Koordinator"; pemetaan ke departemen dikonfirmasi pengurus (nama lama dipakai pada
// poster: Kreatifitas = kini Rinoya, Kewirausahaan = kini Ekonomi Kreatif). Anggota departemen belum diisi.
async function mediaFrom(dir: string, file: string, alt: string) {
  const full = path.join(process.cwd(), 'seed-assets', dir, file)
  if (!fs.existsSync(full)) return undefined
  const data = fs.readFileSync(full)
  const m = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype: 'image/webp', name: file, size: data.length } })
  return m.id
}
const dewan2025 = [
  { name: 'Ahmad Afil', position: 'ketua', file: 'ahmad-afil.webp' },
  { name: 'Muh Afdal Maedja', position: 'ketua1', file: 'muh-afdal-maedja.webp' },
  { name: 'Hidayatul Fatwa', position: 'ketua2', file: 'hidayatul-fatwa.webp' },
  { name: 'Pradigta', position: 'sekum', file: 'pradigta.webp' },
  { name: 'Irma Sitti Rahma', position: 'bendum', file: 'irma-sitti-rahma.webp' },
  { name: 'Kadek Ardi Septadana', position: 'koordinator', dept: 'humas', file: 'kadek-ardi-septadana.webp' },
  { name: 'Rizka Annisa', position: 'koordinator', dept: 'intelektual', file: 'rizka-annisa.webp' },
  { name: 'Hairul', position: 'koordinator', dept: 'kaderisasi', file: 'hairul.webp' },
  { name: 'Andi Amanda A.T', position: 'koordinator', dept: 'kesekretariatan', file: 'andi-amanda.webp' },
  { name: 'Miftahul Zannah', position: 'koordinator', dept: 'ekonomi-kreatif', file: 'miftahul-zannah.webp' },
  { name: 'Moh Risky Mardjuku', position: 'koordinator', dept: 'rinoya', file: 'moh-risky-mardjuku.webp' },
] as const
for (const [i, d] of dewan2025.entries()) {
  const who = await person(d.name)
  const photo = await mediaFrom('pengurus-2025', d.file, `Poster ${d.name}, Dewan Eksekutif 2025`)
  await payload.create({
    collection: 'memberships',
    data: { person: who.id, period: p2025.id, position: d.position, order: i, ...('dept' in d ? { department: depts.find((x) => x.slug === d.dept)?.id } : {}), ...(photo ? { photoOverride: photo, photoIsPoster: true } : {}) },
  })
}

const deptTeams2026: Record<string, { koordinator: string; anggota: string[] }> = {
  kesekretariatan: {
    koordinator: 'Vicram L',
    anggota: ['Latifah Putri Fakhruddin', 'Muhammad Ali Mubaraq', 'Salsabila', 'Anisa Aulia Febrina A Yunda', 'Alifa Nursintia Marsya', 'Fauzhira Dwi Septiana', 'Neneng Eka Arya Komala', 'Ismi Fadilah'],
  },
  kaderisasi: { koordinator: 'Muh. Al-Faiz', anggota: ['Mohammad Arief Prasetyo', 'Dirli Dwi Putra', 'Moh Afadil Agis Pratama', 'Fahri Alamsyah'] },
  intelektual: { koordinator: 'Dwi Candra Andika', anggota: ['Elika Khardalia', 'Amalia Az Zahrah', 'Muhammad Naufal Amar', 'Alif Apriansyah', 'Fadil Wirawan Hi Ardin'] },
  'ekonomi-kreatif': {
    koordinator: 'Isti Zahra Eka Putri Katili',
    anggota: ['Aqilah Nur Aisyah Putri', 'Sri Aswanti', 'Triyanti Aulia', 'Anggita Setiawati', 'Auralia Zalsabillah', 'Nadia', 'Fadhilah Azzahra', 'Asfita Saldarisya Nadjun'],
  },
  humas: {
    koordinator: 'Andi Muhammad Fayyadh',
    anggota: ['Fiqhy Fauzan', 'Raihan S. Atuka', 'Syahril Fitrawan Abadi', 'Andi Faathir Muhammad I.B Samad', 'Moh Haikal Butudoka', 'Fatan Mohammad', 'Muh. Farhan Dg. Masese', 'Wanda Remalia Toripalu'],
  },
  rinoya: {
    koordinator: 'Nakita Semesta',
    anggota: ['Rafli Fauzi', 'Sifa Zikriani', 'Muh Apriawan', 'Chatrin Aurelia', 'Moh. Syahrul R. Umar', 'Dareean Ahmad Raffi Mardin', 'Zahra', 'Cristian Marsel Kasio'],
  },
}
for (const d of depts) {
  const team = deptTeams2026[d.slug]
  if (!team) continue
  const head = await person(team.koordinator)
  await payload.create({ collection: 'memberships', data: { person: head.id, period: p2026.id, department: d.id, position: 'koordinator', order: 0 } })
  for (const [k, name] of team.anggota.entries()) {
    const m = await person(name)
    await payload.create({ collection: 'memberships', data: { person: m.id, period: p2026.id, department: d.id, position: 'anggota', order: k + 1 } })
  }
}

// --- Program kerja & edisi ---
// Nama program dari dokumen MUBES (struktur 2025/2026); TANGGAL dan STATUS adalah data contoh.
type Seed = { name: string; short?: string; slug: string; dept: string; summary: string; start: string; end?: string; status: 'rencana' | 'berjalan' | 'selesai' | 'ditunda'; featured?: boolean; sessions?: ('pagi' | 'siang' | 'sore' | 'malam')[] }
const programDefs: Seed[] = [
  { name: 'Informatics Festival', short: 'I-Fest', slug: 'i-fest', dept: 'rinoya', summary: 'Festival teknologi tahunan.', start: '2026-12-01', end: '2026-12-03', status: 'rencana', featured: true, sessions: ['pagi', 'siang', 'sore', 'malam'] },
  { name: 'Pengabdian Masyarakat', short: 'PenMas', slug: 'penmas', dept: 'rinoya', summary: 'Program pengabdian HMTI UNTAD kepada masyarakat: belajar bersama anak-anak desa, bermain, dan nonton bersama.', start: '2026-06-20', end: '2026-06-22', status: 'selesai', featured: true, sessions: ['pagi', 'siang', 'sore'] },
  { name: 'Dies Natalis', short: 'Dies', slug: 'dies', dept: 'rinoya', summary: 'Perayaan hari jadi himpunan setiap 30 Mei, sejak Dies Natalis pertama pada 2015.', start: '2026-05-28', end: '2026-05-30', status: 'selesai', featured: true, sessions: ['siang', 'malam'] },
  { name: 'Interaksi Bulanan Mahasiswa', short: 'IBM', slug: 'ibm', dept: 'intelektual', summary: 'Forum bulanan pengembangan intelektual mahasiswa.', start: '2026-02-15', status: 'selesai', featured: true, sessions: ['malam'] },
  { name: 'Penalaran Keilmuan', slug: 'penalaran-keilmuan', dept: 'intelektual', summary: 'Kajian keilmuan dan riset bidang teknologi.', start: '2026-04-20', status: 'selesai', sessions: ['siang', 'sore'] },
  { name: 'ALGOMATIK', slug: 'algomatik', dept: 'kaderisasi', summary: 'Proses kaderisasi menuju anggota muda.', start: '2026-05-09', end: '2026-05-11', status: 'selesai', sessions: ['pagi', 'siang', 'sore', 'malam'] },
  { name: 'Latihan Kepemimpinan', short: 'LK', slug: 'latihan-kepemimpinan', dept: 'kaderisasi', summary: 'Pelatihan kepemimpinan anggota.', start: '2026-08-14', end: '2026-08-16', status: 'selesai', sessions: ['pagi', 'sore'] },
  { name: 'Musyawarah Besar', short: 'MUBES', slug: 'mubes', dept: 'kaderisasi', summary: 'Sidang umum anggota: pertanggungjawaban dan pemilihan Ketua Umum.', start: '2026-12-19', end: '2026-12-21', status: 'rencana' },
  { name: 'Mimbar Akbar dan Advokasi', slug: 'mimbar-akbar', dept: 'humas', summary: 'Wadah diskusi dan advokasi isu mahasiswa.', start: '2026-04-05', status: 'selesai', sessions: ['sore', 'malam'] },
  { name: 'Interaksi Sosial Media', short: 'ISM', slug: 'ism', dept: 'humas', summary: 'Pengelolaan konten dan platform digital himpunan.', start: '2026-07-01', end: '2026-12-20', status: 'berjalan' },
  { name: 'PERMIKOMNAS', slug: 'permikomnas', dept: 'humas', summary: 'Keikutsertaan pada forum nasional ilmu komputer.', start: '2026-10-24', status: 'ditunda' },
  { name: 'HMTI Shop', slug: 'hmti-shop', dept: 'ekonomi-kreatif', summary: 'Usaha merchandise himpunan.', start: '2026-10-01', end: '2026-12-31', status: 'berjalan' },
  { name: 'Koperasi', slug: 'koperasi', dept: 'ekonomi-kreatif', summary: 'Koperasi kebutuhan mahasiswa.', start: '2026-11-20', status: 'rencana' },
  { name: 'Pendataan Anggota dan Inventaris', slug: 'pendataan', dept: 'kesekretariatan', summary: 'Pendataan anggota dan inventaris himpunan.', start: '2026-12-05', status: 'rencana' },
]
let penmasId: number | undefined
for (const [i, def] of programDefs.entries()) {
  const department = depts.find((d) => d.slug === def.dept)
  const program = await payload.create({
    collection: 'programs',
    data: { name: def.name, shortName: def.short, slug: def.slug, summary: def.summary, department: department?.id, featured: Boolean(def.featured), order: i },
  })
  if (def.slug === 'penmas') penmasId = program.id
  await payload.create({
    collection: 'editions',
    data: {
      title: `${def.name} 2026`,
      program: program.id,
      period: p2026.id,
      status: def.status,
      sessions: def.sessions,
      startDate: `${def.start}T00:00:00.000+08:00`,
      endDate: def.end ? `${def.end}T00:00:00.000+08:00` : undefined,
      location: def.slug === 'penmas' ? 'Desa Lampo, Kab. Donggala' : 'Lokasi (contoh)',
    },
  })
}

// --- PenMas di Desa Lampo: foto ASLI kegiatan (seed-assets/pengmas, tidak ikut repo). Teks adalah DRAF, sunting lewat admin. ---
if (penmasId) {
  const galleryDefs = [
    ['foto-bersama-lapangan.webp', 'Foto bersama anak-anak desa'],
    ['belajar-di-kelas.webp', 'Belajar membaca dan berhitung di kelas'],
    ['nonton-malam-1.webp', 'Nonton bersama di malam hari'],
    ['foto-bersama-teras.webp', 'Bersama anak-anak di teras sekolah'],
    ['bergaya-bersama.webp', 'Bergaya bersama anak-anak'],
    ['bersama-warga.webp', 'Bersama warga desa'],
    ['tim-di-lapangan.webp', 'Tim PenMas di lapangan desa'],
    ['istirahat-di-sela-kegiatan.webp', 'Istirahat di sela kegiatan'],
    ['nonton-malam-2.webp', 'Suasana nonton bersama'],
  ] as const
  const gallery = []
  for (const [file, caption] of galleryDefs) {
    const id = await mediaFrom('pengmas', file, `PenMas di Desa Lampo: ${caption}`)
    if (id) gallery.push({ image: id, caption })
  }
  const cover = await mediaFrom('pengmas', 'tim-di-lapangan.webp', 'Tim PenMas HMTI UNTAD di lapangan Desa Lampo')
  await payload.update({
    collection: 'programs',
    id: penmasId,
    data: {
      ...(cover ? { cover } : {}),
      about: [
        'Pengabdian Masyarakat (PenMas) adalah program kerja Departemen Riset, Inovasi, dan Karya HMTI UNTAD untuk membawa ilmu dan semangat berbagi langsung ke tengah masyarakat. Sebagai bagian dari Tri Dharma Perguruan Tinggi, PenMas menjadi cara himpunan hadir dan bermanfaat di luar kampus.',
        'Edisi ini berlangsung di Desa Lampo, Kecamatan Banawa Tengah, Kabupaten Donggala, Sulawesi Tengah. Pengurus menemani anak-anak desa belajar membaca dan berhitung, bermain bersama, serta menonton bersama di malam hari.',
        '(Draf: sunting teks ini lewat admin untuk menambahkan tanggal, jumlah peserta, dan hasil kegiatan.)',
      ].join('\n\n'),
      location: {
        name: 'Desa Lampo',
        area: 'Kec. Banawa Tengah, Kab. Donggala, Sulawesi Tengah',
        website: 'https://lampo.digitaldesa.id/',
        mapUrl: 'https://maps.app.goo.gl/GXLabkZBRqCXsTD27',
        lat: -0.7603615,
        lng: 119.7178385,
      },
      gallery,
      productsTitle: 'Produk unggulan Desa Lampo',
      products: [{ name: 'Produk unggulan 1' }, { name: 'Produk unggulan 2' }, { name: 'Produk unggulan 3' }],
    },
  })
}

// --- Hari penting (bintang di heatmap) ---
await payload.create({
  collection: 'special-days',
  data: { title: 'Hari H I-Fest', date: '2026-12-03T00:00:00.000+08:00', recurring: false, description: 'Puncak Informatics Festival, festival teknologi tahunan.', link: '/kegiatan/i-fest/2026' },
})
await payload.create({
  collection: 'special-days',
  data: { title: 'Dies Natalis HMTI UNTAD', date: '2014-05-30T00:00:00.000+08:00', recurring: true, description: 'Hari jadi himpunan: SK Rektor pembentukan HMTI, 30 Mei 2014.', link: '/tentang#sejarah' },
})

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

// Kutipan tokoh untuk bagian Jejak Kepemimpinan. Nama dan isi kutipan MENYUSUL: jangan mengarang ucapan orang
// sungguhan; isi lewat admin (Testimoni, jenis "Kutipan tokoh") setelah kutipan aslinya diterima.
for (const [i, q] of [
  { authorName: 'Nama menyusul', authorRole: 'Perwakilan pendiri HMTI UNTAD', quote: '(contoh) Kutipan dari perwakilan pendiri himpunan akan ditampilkan di sini.' },
  { authorName: 'Nama menyusul', authorRole: 'Ketua Umum pertama HMTI UNTAD, 2014', quote: '(contoh) Kutipan dari Ketua Umum pertama akan ditampilkan di sini.' },
  { authorName: 'Yuri Yudhaswana Joefrie, S.T., M.T., Ph.D.', authorRole: 'Kepala Program Studi S1 Teknik Informatika', quote: '(contoh) Kutipan dari Kepala Program Studi akan ditampilkan di sini.' },
].entries()) {
  const photo = q.authorName.startsWith('Yuri') ? await mediaFrom('tokoh', 'yuri-yudhaswana-joefrie.webp', 'Foto Yuri Yudhaswana Joefrie, S.T., M.T., Ph.D.') : undefined
  await payload.create({ collection: 'testimonials', data: { ...q, kind: 'tokoh', order: i, ...(photo ? { photo } : {}) } })
}

// --- Hasil riset contoh (DUMMY: ganti dengan publikasi asli lewat admin) ---
const lexical = (...paras: string[]) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: paras.map((text) => ({
      type: 'paragraph',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [{ type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
    })),
  },
})
for (const r of [
  { title: 'Peta Tren Teknologi Mahasiswa Informatika (contoh)', slug: 'peta-tren-teknologi-contoh', kind: 'riset', dept: 'rinoya', authors: 'Tim Rinoya', tags: 'tren, teknologi, survei', publishedAt: '2026-10-12T09:00:00.000+08:00', summary: 'Contoh publikasi: ringkasan hasil survei minat teknologi mahasiswa. Ganti dengan riset asli.', body: ['Ini teks contoh untuk menampilkan tata letak halaman riset.', 'Isi asli diunggah lewat admin: ringkasan, isi lengkap, berkas PDF, dan tautan sumber.'] },
  { title: 'Catatan Diskusi IBM: Etika Penggunaan AI (contoh)', slug: 'catatan-ibm-etika-ai-contoh', kind: 'artikel', dept: 'intelektual', authors: 'Departemen Intelektual', tags: 'ibm, diskusi, ai', publishedAt: '2026-09-02T20:00:00.000+08:00', summary: 'Contoh artikel: rangkuman diskusi Interaksi Bulanan Mahasiswa.', body: ['Teks contoh untuk artikel keilmuan.'] },
  { title: 'Temuan Awal Survei Kepuasan Layanan Inventaris (contoh)', slug: 'temuan-survei-inventaris-contoh', kind: 'temuan', dept: 'humas', authors: 'Tim Humas', tags: 'survei, layanan', publishedAt: '2026-08-20T10:00:00.000+08:00', summary: 'Contoh temuan: gambaran awal kepuasan pengguna layanan peminjaman inventaris.', body: ['Teks contoh untuk temuan penelitian.'] },
] as const) {
  const department = depts.find((d) => d.slug === r.dept)
  await payload.create({
    collection: 'researches',
    data: { title: r.title, slug: r.slug, kind: r.kind, department: department?.id, authors: r.authors, tags: r.tags, publishedAt: r.publishedAt, summary: r.summary, content: lexical(...r.body), _status: 'published' },
  })
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

// Foto "The Best of" contoh: gambar gradasi dibuat lokal (belum ada foto asli).
const tints: [string, string][] = [['#3e4094', '#b4d6fe'], ['#5253ad', '#e3e5f1'], ['#2a2b57', '#9cc4f5'], ['#3e4094', '#cfe3fb'], ['#121212', '#5253ad'], ['#5253ad', '#b4d6fe'], ['#2a2b57', '#cfe3fb']]
async function sampleImage(n: number) {
  const [a, b] = tints[n % tints.length]
  const dots = Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 97 + n * 53) % 800}" cy="${(i * 151 + n * 71) % 800}" r="${30 + ((i * 13) % 50)}" fill="#fff" opacity="0.10"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/>${dots}<text x="400" y="430" font-size="64" font-family="sans-serif" fill="#fff" fill-opacity="0.85" text-anchor="middle">Foto contoh ${n + 1}</text></svg>`
  const data = await sharp(Buffer.from(svg)).png().toBuffer()
  return payload.create({ collection: 'media', data: { alt: `Foto contoh ${n + 1}` }, file: { data, mimetype: 'image/png', name: `foto-contoh-${n + 1}.png`, size: data.length } })
}
const bestCaptions = ['I-Fest hari pertama', 'Ngabdi di desa', 'Rapat kerja', 'Dies Natalis', 'ALGOMATIK', 'Latihan Kepemimpinan', 'Foto bersama']
for (const [i, caption] of bestCaptions.entries()) {
  const img = await sampleImage(i)
  await payload.create({ collection: 'best-photos', data: { image: img.id, caption: `${caption} (contoh)`, year: 2026, order: i } })
}
for (const [i, caption] of ['Mubes 2025', 'Pelantikan', 'Buka puasa bersama'].entries()) {
  const img = await sampleImage(i + 3)
  await payload.create({ collection: 'best-photos', data: { image: img.id, caption: `${caption} (contoh)`, year: 2025, order: i } })
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
  { name: 'Peminjaman Inventaris', slug: 'peminjaman-inventaris', group: 'organisasi', summary: 'Pinjam atau sewa perlengkapan acara milik himpunan. Anggota ALGOMATIK bebas biaya sewa; pihak luar cukup dengan surat resmi.' },
  { name: 'Penyuratan', slug: 'penyuratan', group: 'organisasi', summary: 'Ajukan surat resmi atas nama himpunan untuk undangan, permohonan, atau kegiatan bersama.' },
  { name: 'Media Partner', slug: 'media-partner', group: 'organisasi', summary: 'Publikasikan kegiatanmu lewat kanal media sosial HMTI UNTAD dan jaringan mahasiswa Informatika.' },
  { name: 'Kerja Sama', slug: 'kerja-sama', group: 'organisasi', summary: 'Kolaborasi acara, sponsor, pelatihan, atau program bersama instansi dan komunitas.' },
  { name: 'Jasa Website', slug: 'jasa-website', group: 'bisnis', summary: 'Website profil, landing page, atau sistem sederhana untuk organisasi dan usaha.' },
  { name: 'Konsultasi', slug: 'konsultasi', group: 'bisnis', summary: 'Diskusi kebutuhan teknologi: memilih perangkat, merancang sistem, atau digitalisasi usaha.' },
  { name: 'Service Hardware', slug: 'service-hardware', group: 'bisnis', summary: 'Perbaikan dan perawatan laptop serta komputer, termasuk instalasi perangkat lunak.' },
  { name: 'Jasa Design', slug: 'jasa-design', group: 'bisnis', summary: 'Desain grafis, materi publikasi, logo, dan rancangan antarmuka (UI).' },
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
