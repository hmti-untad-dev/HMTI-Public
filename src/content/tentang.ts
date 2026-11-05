/**
 * Konten halaman Tentang. Sumber: AD/ART 2026, GBHO 2025, SOP 2026 (MUBES 2026) dan draft yang disetujui pengurus.
 * Teks tingkat anggaran dasar jarang berubah, jadi disimpan di kode. Visi/misi periode aktif tetap dari CMS (lihat page.tsx).
 */

/** Jargon HMTI. Dipakai bila pengaturan situs belum mengisi motto. */
export const MOTTO = 'We Make A Better Future'

/** Kredit pembuat situs, tampil di baris paling bawah footer. */
export const CREDIT = 'Dibuat oleh Nakita Semesta & kepengurusan HMTI UNTAD Kabinet All Blue periode 2026.'

export const INTRO =
  'Wadah mahasiswa program studi S1 Teknik Informatika, Fakultas Teknik, Universitas Tadulako untuk berkontribusi secara aktif, partisipatif, dan demokratis.'

export const SIAPA_KAMI = [
  'HMTI UNTAD adalah pusat koordinasi mahasiswa program studi S1 Teknik Informatika Universitas Tadulako. Himpunan ini dibentuk agar mahasiswa dapat berkumpul dan bekerja sama secara rasional, sistematis, dan terkendali untuk mencapai tujuan bersama.',
  'HMTI UNTAD juga menaungi komunitas yang dibentuk dari minat dan bakat mahasiswa, serta terbuka bekerja sama dengan individu maupun institusi yang sejalan dengan asas dan tujuannya.',
]

export const VISI_GBHO = 'Menjadikan HMTI UNTAD sebagai organisasi yang solid, berintegritas, sistematis dan profesional.'
export const MISI_GBHO = [
  'Meningkatkan mutu kualitas akademik dan non-akademik anggota HMTI UNTAD.',
  'Menjalin kerja sama dengan individu maupun instansi yang memiliki visi misi yang sama dengan HMTI UNTAD.',
  'Meningkatkan kepedulian terhadap lingkungan dan pengabdian terhadap masyarakat.',
]

export const ASAS = ['Pancasila', 'Tri Dharma Perguruan Tinggi', 'Kekeluargaan']
export const NILAI = ['Ketakwaan', 'Kekeluargaan', 'Moralis', 'Intelektual', 'Profesional', 'Kepemimpinan', 'Ketegasan']

export const TUJUAN = [
  'Wadah mahasiswa program studi S1 Teknik Informatika agar berkumpul dan bekerja sama secara rasional, sistematis, dan terkendali.',
  'Wadah yang menaungi komunitas-komunitas yang dibentuk HMTI UNTAD.',
  'Meningkatkan kualitas mahasiswa dalam bidang akademik dan non-akademik.',
  'Bekerja sama atau berkolaborasi dengan individu maupun institusi yang sesuai dengan asas dan tujuan HMTI UNTAD.',
]

export const JENJANG = [
  { name: 'Pasif', text: 'Mahasiswa program studi S1 Teknik Informatika yang telah mengikuti Pengenalan HMTI UNTAD secara resmi.' },
  { name: 'Muda', text: 'Anggota pasif yang telah melewati proses ALGOMATIK.' },
  { name: 'Biasa', text: 'Anggota muda yang telah mengikuti dan menjalankan kewajiban pada waktu yang ditentukan Dewan Eksekutif.' },
  { name: 'Demisioner', text: 'Anggota biasa yang telah selesai periode kepengurusan angkatan kadernya.' },
  { name: 'Purna', text: 'Anggota demisioner yang telah menyelesaikan masa studi di program studi S1 Teknik Informatika.' },
]

export const STRUKTUR = [
  {
    name: 'Dewan Eksekutif',
    text: 'Badan yang melaksanakan program kerja sesuai GBHO dan SOP. Terdiri dari Ketua Umum, Ketua I, Ketua II, Sekretaris Umum, Bendahara Umum, dan para Koordinator Departemen. Ketua Umum dipilih untuk masa jabatan satu tahun pada Musyawarah Besar.',
    href: '/kepengurusan',
    cta: 'Lihat pengurus',
  },
  {
    name: 'Dewan Perwakilan Angkatan (DPA)',
    text: 'Dewan yang mewakili angkatannya dalam HMTI UNTAD, memperhatikan masalah di angkatannya, dan dapat mengusulkan rapat evaluasi kepada Dewan Eksekutif. Dipilih oleh panitia bentukan Dewan Eksekutif dan dilantik pada Musyawarah Besar.',
  },
  {
    name: 'Badan Pengawas Organisasi (BPO)',
    text: 'Badan yang mengawasi kinerja Dewan Eksekutif, meminta penjelasan atas kebijakannya, dan memeriksa laporan pertanggungjawaban.',
  },
  {
    name: 'Komunitas binaan',
    text: 'Programming Tadulako dan Animedia Tadulako: unit kegiatan semi-otonom dengan struktur kerja sendiri yang tetap berada dalam koordinasi HMTI UNTAD, wadah minat dan bakat mahasiswa.',
  },
]

/*
 * Sejarah HMTI. Sumber: dokumen "Sejarah Pembentukan Himpunan Mahasiswa Teknik Informatika", presentasi
 * "Sejarah", dan "Visi dan misi" dari Ketua Umum pertama HMTI UNTAD (diterima November 2026).
 * Foto di public/sejarah/ berasal dari presentasi yang sama.
 */
export const SEJARAH_HMTI_INTRO =
  'HMTI UNTAD lahir dari inisiatif mahasiswa Teknik Informatika sendiri. Mahasiswa angkatan 2012 merumuskan alasan membentuk himpunan, lalu mengajukan permohonan ke program studi. Pada 30 Mei 2014 Rektor Universitas Tadulako menetapkan pembentukan Himpunan Mahasiswa Teknik Informatika (HMTI) pada Fakultas Teknik, dan tanggal itu kini diperingati sebagai Dies Natalis himpunan.'

export const JARGON_AWAL = 'Kami belajar, kami bekerja, dan kami membangun.'

export type Tonggak = { date: string; title: string; text: string; key?: boolean; images?: { src: string; alt: string; w: number; h: number }[] }
export const LINIMASA_HMTI: Tonggak[] = [
  { date: '13 Mei 2014', title: 'Usulan pembentukan', text: 'Atas permohonan mahasiswa, program studi menyurat untuk mengusulkan penerbitan Surat Keputusan pembentukan himpunan.' },
  {
    date: '30 Mei 2014',
    title: 'SK Rektor: HMTI resmi berdiri',
    text: 'Rektor Universitas Tadulako menetapkan pembentukan HMTI pada Fakultas Teknik, untuk mewadahi dan mempermudah koordinasi kegiatan kemahasiswaan program studi S1 Teknik Informatika.',
    key: true,
  },
  {
    date: '20 Juni 2014',
    title: 'Pemilihan ketua pertama',
    text: 'Rapat pemilihan Ketua HMTI dihadiri mahasiswa informatika angkatan 2012, perwakilan Himpunan Mahasiswa Elektro (HME), dosen informatika, dan Wakil Ketua Jurusan Teknik Elektro.',
  },
  { date: '15 Juli 2014', title: 'Permohonan SK kepengurusan', text: 'Himpunan belum memiliki kepengurusan resmi, sehingga program studi kembali menyurat untuk penerbitan SK kepengurusan.' },
  { date: '26 Agustus 2014', title: 'SK Dekan: pengurus pertama', text: 'Dekan Fakultas Teknik menetapkan pengangkatan pengurus HMTI tahun 2014, kepengurusan pertama himpunan.', key: true },
  {
    date: '2014',
    title: 'Membangun fondasi',
    text: 'Pengurus pertama menyusun AD/ART, membuat logo, merenovasi sekretariat, merancang baju PDH, dan membuat bendera himpunan.',
    images: [
      { src: '/sejarah/logo-awal.webp', alt: 'Logo HMTI di masa awal', w: 367, h: 391 },
      { src: '/sejarah/pdh.webp', alt: 'Rancangan baju PDH HMTI tampak depan dan belakang', w: 1400, h: 532 },
    ],
  },
  { date: '30 Mei 2015', title: 'Dies Natalis pertama', text: 'Satu tahun HMTI dirayakan dengan tema "First Step for a Better Future", dirangkai bakti sosial di Panti Asuhan As-Salam.', key: true },
]

export const ALASAN_PEMBENTUKAN = [
  'Menjadi wadah mahasiswa informatika.',
  'Tempat mahasiswa berkumpul dan bekerja sama secara rasional, sistematis, dan terkendali, memanfaatkan sumber daya (dana, material, lingkungan, metode, sarana, prasarana, data) secara efisien dan efektif untuk mencapai tujuan bersama.',
  'Menjadi payung bagi komunitas-komunitas IT yang dibentuk oleh mahasiswa informatika.',
  'Meningkatkan kualitas mahasiswa dalam bidang akademik dan non-akademik.',
  'Bekerja sama dan berkolaborasi dengan himpunan dan UKM yang tergabung di OKFT.',
  'Menjadi salah satu poin pendukung akreditasi program studi informatika.',
  'Mendorong mahasiswa untuk terus melakukan perbaikan dan mempertahankan mutu yang tinggi.',
]

/** Visi dan misi periode pertama (2014), disimpan sebagai catatan sejarah. Visi-misi berjalan ada di VISI_GBHO / CMS. */
export const VISI_AWAL =
  'Mewujudkan Himpunan Mahasiswa Informatika yang harmonis berasaskan kekeluargaan dan mampu menciptakan mahasiswa yang profesional, unggul, dan kompeten secara akademik maupun non-akademik.'
export const MISI_AWAL = [
  'Menjadikan kekeluargaan yang terikat sebagai budaya HMTI.',
  'Memberikan informasi yang dibutuhkan oleh mahasiswa Informatika Tadulako.',
  'Mewadahi mahasiswa, alumni, dosen, dan karyawan dalam satu wadah guna membangun informatika yang lebih baik.',
  'Meningkatkan potensi tiap individu mahasiswa dalam bidang akademik maupun non-akademik.',
]

/** Arsip foto kegiatan periode 2014-2015 (polaroid di halaman Tentang). */
export const ARSIP_AWAL = [
  { id: 'penerimaan-1', src: '/sejarah/penerimaan-1.webp', caption: 'Penerimaan anggota' },
  { id: 'penerimaan-2', src: '/sejarah/penerimaan-2.webp', caption: 'Bina akrab' },
  { id: 'penerimaan-3', src: '/sejarah/penerimaan-3.webp', caption: 'Materi bina akrab' },
  { id: 'dies-2', src: '/sejarah/dies-2.webp', caption: 'Dies Natalis ke-1' },
  { id: 'dies-3', src: '/sejarah/dies-3.webp', caption: 'First step, 30 Mei 2015' },
  { id: 'dies-4', src: '/sejarah/dies-4.webp', caption: 'Kue ulang tahun pertama' },
  { id: 'dies-1', src: '/sejarah/dies-1.webp', caption: 'Panggung Dies Natalis' },
  { id: 'baksos-1', src: '/sejarah/baksos-1.webp', caption: 'Bakti sosial As-Salam' },
  { id: 'baksos-2', src: '/sejarah/baksos-2.webp', caption: 'Bersama adik-adik panti' },
  { id: 'baksos-3', src: '/sejarah/baksos-3.webp', caption: 'Foto bersama di panti' },
  { id: 'foto-bersama', src: '/sejarah/foto-bersama.webp', caption: 'Foto bersama pengurus' },
]

export const SEJARAH_JUDUL = 'Sejarah Program Studi'
export const SEJARAH = [
  'Program Studi S1 Teknik Informatika Universitas Tadulako lahir pada 16 April 2012 melalui SK Pendirian No. 2428/UN28/LK/2012, dan diakui melalui Keputusan Menteri No. 092/P/2014 pada 5 Maret 2014. Sejak itu program studi ini menjadi pilihan banyak calon mahasiswa, dan tidak hanya mencetak sarjana, tetapi juga membentuk pemimpin masa depan di dunia informatika.',
  'Minat calon mahasiswa melalui jalur SNMPTN dan SBMPTN terus konsisten. Pengembangan ilmu dan keterampilan didukung 31 dosen, dan program studi meraih peringkat akreditasi "Baik Sekali" berdasarkan Keputusan LAM INFOKOM No. 133/SK/LAM-INFOKOM/Ak/S/XXII./2022. Di dalam perjalanan itulah HMTI UNTAD tumbuh sebagai rumah bersama mahasiswanya.',
]

export const MARS_JUDUL = 'Mars HMTI UNTAD'
export const MARS_PENCIPTA = 'Cipt. Rio A. Saerang & Muh. Gifari Sundu'
export const MARS_YOUTUBE = 'https://www.youtube.com/watch?v=ITpl2CQLkok'
export const MARS_BAIT = [
  ['Kami mahasiswa Teknik Informatika', 'Satu teguh dalam cita-cita bersama', 'Menjujung tinggi bhineka tunggal ika', 'Dibawah panji persatuan'],
  ['Himpunan mahasiswa Teknik Informatika', 'Terus berkarya membangun nusa dan bangsa', 'Demi mewujudkan Tri Dharma nan mulia', 'Universitas Tadulako'],
  ['Mahasiswa sebagai insan intelektual', 'Pelopor penggerak Teknologi Informasi', 'Dengan semangat jiwa dan raga mahasiswa', 'Untukmu Indonesia tercinta'],
]

export const DOKUMEN_PUBLIK = [
  { title: 'Anggaran Dasar dan Anggaran Rumah Tangga 2026', href: '/dokumen/AD-ART-HMTI-UNTAD-2026.pdf', size: '624 KB' },
  { title: 'Garis-Garis Besar Haluan Organisasi 2025', href: '/dokumen/GBHO-HMTI-UNTAD-2025.pdf', size: '179 KB' },
]
