/**
 * Konten Informatics Festival (I-FEST) 2025, dari Laporan Kegiatan I-Fest HMTI UNTAD 2025 (panitia) dan liputan
 * Tribun Palu 12 November 2025. Dipakai oleh scripts/seed.ts dan skrip impor sekali jalan.
 *
 * Angka dikonfirmasi pengurus: 2.525 peserta (2.607 bila panitia pelaksana dihitung), 13 sekolah roadshow,
 * 244 peserta lomba digital dan expo. Pemenang perorangan tingkat pelajar sengaja tidak dicantumkan namanya
 * (permintaan pengurus); yang tampil hanya tim, sekolah, instansi, dan judul karya.
 * Tidak dimuat: rincian dana dan lembar pengesahan laporan.
 */

export const IFEST_2025 = {
  title: 'Informatics Festival 2025',
  theme: 'Resonansi Digital: Kolaborasi Inovatif Generasi Muda dalam Transformasi Teknologi yang Berdampak',
  status: 'selesai' as const,
  startDate: '2025-11-11T00:00:00.000+08:00',
  endDate: '2025-11-12T00:00:00.000+08:00',
  location: 'Auditorium Universitas Tadulako, Palu',
  paragraphs: [
    'Informatics Festival (I-FEST) 2025 adalah jawaban HMTI UNTAD atas maraknya hoaks, penipuan digital, penyalahgunaan data pribadi, dan rendahnya kesadaran keamanan siber di Sulawesi Tengah. Lewat edukasi, kompetisi, dan kolaborasi, festival ini mempertemukan pemerintah, akademisi, industri, komunitas, dan masyarakat dalam satu ekosistem digital yang sehat dan aman.',
    'Rangkaiannya berjalan sejak September 2025: roadshow ke 13 sekolah di Kota Palu, kompetisi digital, Bulan Inklusi Keuangan bersama OJK Sulteng, dan workshop bersama komunitas Hammercode. Puncaknya, I-Fest Days 11–12 November 2025 di Auditorium Universitas Tadulako, menghadirkan Expo Berani Berinovasi, seminar "Peran Teknologi untuk Pembangunan Daerah" bersama Telkom Witel Sulbagteng, talkshow "Sulawesi Tengah, Siapkah Terdigitalisasi?", serta pengumuman pemenang I-COM 2025.',
  ],
  stats: [
    { value: '2.525', label: 'Peserta di seluruh rangkaian (2.607 bersama panitia pelaksana)' },
    { value: '13', label: 'Sekolah dikunjungi roadshow, 520 siswa ikut sesi edukasi' },
    { value: '1.082', label: 'Orang memadati Auditorium UNTAD saat I-Fest Days' },
    { value: '244', label: 'Peserta lomba digital dan Expo Inovasi' },
    { value: '30', label: 'Produk teknologi dipamerkan di Expo Berani Berinovasi' },
    { value: '390,1 rb', label: 'Akun dijangkau Instagram @ifest_untad selama kegiatan' },
  ],
  timeline: [
    {
      name: 'Roadshow "Digital Resonance Tour"',
      date: '8 Sep – 10 Okt 2025',
      place: '13 SMA/SMK di Kota Palu',
      detail: 'Edukasi bahaya penipuan digital (fraud) dan social engineering serta pentingnya literasi digital.',
    },
    {
      name: 'Kompetisi Digital',
      date: '15 Sep – 12 Nov 2025',
      place: 'Daring dan luring',
      detail: 'Lomba video edukasi "Think Before You Click", poster digital "Lawan Jerat Fraud & Social Engineering", desain UI/UX "Resonansi Digital", public speaking, dan e-sport MLBB.',
    },
    {
      name: 'Bulan Inklusi Keuangan',
      date: '25 Okt 2025',
      place: 'Atrium Hall, Palu Grand Mall',
      detail: 'Seminar dan kompetisi bersama OJK Sulteng dan Diskominfosantik Sulteng untuk mendorong literasi dan inklusi keuangan digital.',
    },
    {
      name: 'Workshop bersama Hammercode',
      date: '9 Nov 2025',
      place: 'Daring',
      detail: 'Praktisi komunitas Hammercode berbagi cara membuat situs web tanpa coding dengan Webflow.',
    },
    {
      name: 'I-Fest Days',
      date: '11–12 Nov 2025',
      place: 'Auditorium Universitas Tadulako',
      detail: 'Hari 1: pembukaan Expo Berani Berinovasi dan penjurian. Hari 2: seminar, talkshow, pengumuman pemenang I-COM 2025, dan hiburan penutup.',
    },
  ],
  winners: [
    {
      competition: 'Desain UI/UX',
      rank: 'Juara 1',
      entrant: 'Tim Sedang Juara, Universitas Brawijaya',
      work: 'Aksa: Platform Edukasi Karir Inklusif Berbasis Juru Bahasa Isyarat (JBI) & AI untuk Pemberdayaan Talenta Tuli',
    },
    {
      competition: 'Desain UI/UX',
      rank: 'Juara 2',
      entrant: 'Tim Penglaris Kopjay, Universitas Brawijaya',
      work: 'Oxima: Aplikasi Pemantauan Polusi Berbasis AI dengan Personalisasi untuk Mendorong Perilaku Sehat Masyarakat di Perkotaan',
    },
    {
      competition: 'Desain UI/UX',
      rank: 'Juara 3',
      entrant: 'Tim Pria Hujan, Universitas Brawijaya',
      work: 'Dentaku: Platform Cerdas Berbasis Asisten AI dalam Mempercepat Diagnosis dan Pembuatan Rencana Perawatan untuk Dokter Gigi',
    },
    { competition: 'Poster Digital', rank: 'Juara 1', entrant: 'SMAS Al-Azhar Mandiri Palu', work: 'Kukira Teman, Rupanya Ancaman' },
    {
      competition: 'Poster Digital',
      rank: 'Juara 2',
      entrant: 'SMAN Model Terpadu Madani',
      work: 'Manis di Awal, Celaka di Akhir: Tingkatkan Awareness terhadap Penipuan Digital (Anti Modus Hadiah Palsu)',
    },
    { competition: 'Poster Digital', rank: 'Juara 3', entrant: 'SMKN 1 Palu', work: 'Hadiah Palsu, Celaka Nyata' },
    { competition: 'Expo Inovasi Digital', rank: 'Juara 1', entrant: 'Ternary', work: 'AI Web Developer' },
    { competition: 'Expo Inovasi Digital', rank: 'Juara 2', entrant: '', work: 'Showcase VR Megalit Sulawesi Tengah' },
    { competition: 'Expo Inovasi Digital', rank: 'Juara 3', entrant: 'Robotech Tadulako', work: 'Robot Taro' },
  ],
  coverage: [
    {
      outlet: 'Tribun Palu',
      title: 'Mahasiswa Teknik Untad Gelar I-Fest 2025, Tingkatkan Wawasan Digital Masyarakat',
      url: 'https://palu.tribunnews.com/palu/172883/mahasiswa-teknik-untad-gelar-i-fest-2025-tingkatkan-wawasan-digital-masyarakat',
    },
    {
      outlet: 'Tribun Palu',
      title: 'Hadiri I-Fest 2025, Pemprov Sebut Sulteng Butuh SDM Yang Melek Teknologi',
      url: 'https://palu.tribunnews.com/sulteng/172889/hadiri-i-fest-2025-pemprov-sebut-sulteng-butuh-sdm-yang-melek-teknologi',
    },
    {
      outlet: 'Tribun Palu',
      title: 'Generasi Muda Sulawesi Tengah Tampil di Informatics Festival 2025',
      url: 'https://palu.tribunnews.com/palu/172890/generasi-muda-sulawesi-tengah-tampil-di-informatics-festival-2025',
    },
    {
      outlet: 'Tribun Palu',
      title: 'OJK Sulteng Dukung I-Fest 2025 Untad, Dorong Literasi dan Inklusi Keuangan Digital',
      url: 'https://palu.tribunnews.com/palu/172897/ojk-sulteng-dukung-i-fest-2025-untad-dorong-literasi-dan-inklusi-keuangan-digital',
    },
    {
      outlet: 'Sulteng Raya',
      title: 'Koran Sulteng Raya edisi 30 Oktober 2025',
      url: 'https://sultengraya.com/wp-content/uploads/2025/10/SR-EDISI-30-OKTOBER-2025_compressed.pdf',
    },
  ],
}

/** Kutipan tamu; teks verbatim dari liputan/laporan, dipangkas dengan elipsis tanpa mengubah kata. */
export const IFEST_2025_QUOTES = [
  {
    authorName: 'M. Sadly Lesnusa, S.Sos., M.Si.',
    authorRole: 'Asisten III Gubernur Sulawesi Tengah, mewakili Gubernur',
    quote:
      'Informatics festival bukan hanya sekadar kegiatan rutin tahunan, melainkan ajang pertemuan ide, ilmu, dan inovasi. … Generasi muda khususnya mahasiswa teknik informatika memegang peran yang sangat penting sebagai agen perubahan dan pembaharu bangsa.',
    sourceUrl: 'https://palu.tribunnews.com/sulteng/172889/hadiri-i-fest-2025-pemprov-sebut-sulteng-butuh-sdm-yang-melek-teknologi',
    order: 1,
  },
  {
    authorName: 'Bonny Hardi Putra',
    authorRole: 'Kepala Otoritas Jasa Keuangan (OJK) Sulawesi Tengah',
    quote:
      'Semangat kolaborasi yang ditampilkan dalam I-Fest 2025 mencerminkan sinergi positif antar dunia pendidikan dan lembaga keuangan, hal ini sejalan dengan tema BIK 2025 yaitu Sulteng Nambaso.',
    sourceUrl: 'https://palu.tribunnews.com/palu/172897/ojk-sulteng-dukung-i-fest-2025-untad-dorong-literasi-dan-inklusi-keuangan-digital',
    order: 2,
  },
  {
    authorName: 'Dr. Yuli Asmi Rahman, S.T., M.Sc.',
    authorRole: 'Wakil Dekan I Fakultas Teknik Universitas Tadulako',
    quote:
      'Kegiatan I-FEST ini menjadi bukti nyata bahwa mahasiswa Teknik Informatika UNTAD mampu menjadi agent of change dan berkontribusi langsung pada edukasi publik.',
    sourceUrl: '',
    order: 3,
  },
]

type Role = 'kolaborator' | 'sponsor-utama' | 'sponsor' | 'media'

/** Mitra, sponsor, dan media partner sesuai halaman "Mitra, Sponsorship dan Media Partner" laporan. */
export const IFEST_2025_PARTNERS: { name: string; role: Role }[] = [
  ...['Jurusan Teknologi Informasi UNTAD', 'Fakultas Teknik UNTAD', 'Universitas Tadulako', 'OJK Sulawesi Tengah'].map((name) => ({
    name,
    role: 'kolaborator' as const,
  })),
  { name: 'Nilam Sari Lawira', role: 'sponsor-utama' },
  ...[
    'Maxim',
    'Sultan Music',
    'Diskominfosantik Sulteng',
    'Yukensi Bikin Baju',
    'Lembaga Amil Zakat Hadji Kalla',
    'Telkom Indonesia Sulbagteng',
    'Google Student Ambassador Program',
    'Yayasan Merah Putih Sulteng',
    'Smart Kitchen',
    'BaCoding',
    'Caffino',
    'Basnap',
    'Berdikari Project',
  ].map((name) => ({ name, role: 'sponsor' as const })),
  ...[
    'Tribun Palu',
    'Animedia',
    'Programming Tadulako',
    'Floin Hub',
    'Badan Pers Mahasiswa Fakultas Teknik',
    'PERMIKOMNAS Nasional',
    'PERMIKOMNAS Wilayah X',
    'Fisip On-Air',
    'STIMIK Adhi Guna Palu',
    'LPM Hitam Putih',
    'LPM Nahesa',
    'HMPTI',
    'Pesona Lere',
    'LPM Nasional',
    'Mahaswara',
    'SIGA Creative Studio',
    'Datokarama Programming Community',
    'Info Lomba IT',
    'CSRELATED Competition',
    'TeknoEvent',
    'Lomba Tekno',
    'Tekno Event Academy',
    'Lomba UI/UX',
    'Teras Event',
    'TeknoEvent Campus',
  ].map((name) => ({ name, role: 'media' as const })),
]

/** Paragraf polos -> richText Lexical minimal untuk field `description`. */
export function lexicalParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  }
}

/**
 * Membuat edisi I-FEST 2025 beserta kutipan dan mitranya. Aman diulang: dilewati bila edisi berjudul sama sudah ada.
 * `programId`/`periodId`: program I-Fest dan periode 2025.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createIfest2025(payload: any, programId: number, periodId: number) {
  const found = await payload.find({ collection: 'editions', where: { title: { equals: IFEST_2025.title } }, limit: 1 })
  if (found.totalDocs > 0) return found.docs[0]

  const { paragraphs, ...rest } = IFEST_2025
  const edition = await payload.create({
    collection: 'editions',
    data: { ...rest, program: programId, period: periodId, description: lexicalParagraphs(paragraphs) },
  })
  for (const q of IFEST_2025_QUOTES) {
    await payload.create({ collection: 'testimonials', data: { ...q, kind: 'testimoni', edition: edition.id } })
  }
  for (const [i, p] of IFEST_2025_PARTNERS.entries()) {
    await payload.create({ collection: 'partners', data: { ...p, order: i, editions: [edition.id] } })
  }
  return edition
}
