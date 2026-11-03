/** Menu utama (maks. 5 item). Isi dropdown "Kepengurusan" ditambah dinamis dari CMS (departemen & arsip periode). */
export type NavLink = { href: string; label: string; external?: boolean }
export type NavGroup = { label: string; href: string; items?: NavLink[] }

export const JTI_URL = 'https://jti.fatek.untad.ac.id/'

/** Tautan ke situs Jurusan Teknologi Informasi. Alamat diverifikasi dari situs JTI (2026-11-04). */
export const JTI_LINKS: NavLink[] = [
  { href: JTI_URL, label: 'Beranda JTI', external: true },
  { href: `${JTI_URL}kurikulum`, label: 'Kurikulum', external: true },
  { href: `${JTI_URL}dosen`, label: 'Dosen', external: true },
  { href: `${JTI_URL}fasilitas`, label: 'Fasilitas', external: true },
  { href: `${JTI_URL}kategori/himpunan`, label: 'Berita Himpunan di JTI', external: true },
  { href: `${JTI_URL}kategori/prestasi`, label: 'Prestasi mahasiswa', external: true },
]

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Tentang',
    href: '/tentang',
    items: [
      { href: '/tentang#siapa-kami', label: 'Siapa kami' },
      { href: '/tentang#visi-misi', label: 'Visi dan misi' },
      { href: '/tentang#lambang', label: 'Makna lambang' },
      { href: '/tentang#keanggotaan', label: 'Keanggotaan' },
      { href: '/tentang#struktur', label: 'Struktur organisasi' },
      { href: '/tentang#sejarah', label: 'Sejarah' },
      { href: '/tentang#mars', label: 'Mars HMTI UNTAD' },
      { href: '/tentang#dokumen', label: 'Dokumen' },
      { href: JTI_URL, label: 'Jurusan Teknologi Informasi', external: true },
    ],
  },
  { label: 'Kepengurusan', href: '/kepengurusan', items: [{ href: '/kepengurusan', label: 'Pengurus periode aktif' }] },
  {
    label: 'Kegiatan',
    href: '/kegiatan',
    items: [
      { href: '/kegiatan', label: 'Program kerja' },
      { href: '/berita', label: 'Berita' },
      { href: '/galeri', label: 'Galeri' },
    ],
  },
  {
    label: 'Layanan',
    href: '/layanan',
    items: [
      { href: '/layanan', label: 'Semua layanan' },
      { href: '/layanan/peminjaman-inventaris', label: 'Peminjaman inventaris' },
      { href: '/layanan/penyuratan', label: 'Penyuratan' },
      { href: '/layanan/kerja-sama', label: 'Kerja sama' },
      { href: '/layanan/lacak', label: 'Lacak permintaan' },
      { href: '/aspirasi', label: 'Aspirasi' },
    ],
  },
  { label: 'Kontak', href: '/kontak' },
]

/** Daftar datar untuk footer. */
export const NAV_ITEMS = [{ href: '/', label: 'Beranda' }, ...NAV_GROUPS.map(({ href, label }) => ({ href, label }))]

/** Sementara mengarah ke admin Payload; nanti diganti SSO sistem internal. */
export const LOGIN_HREF = '/admin'
