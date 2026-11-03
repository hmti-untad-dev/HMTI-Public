/** Menu utama. Ubah di sini; Navbar dan Footer mengikuti. */
export const NAV_ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/kepengurusan', label: 'Kepengurusan' },
  { href: '/kegiatan', label: 'Kegiatan' },
  { href: '/berita', label: 'Berita' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/layanan', label: 'Layanan' },
  { href: '/kontak', label: 'Kontak' },
] as const

/** Sementara mengarah ke admin Payload; nanti diganti SSO sistem internal. */
export const LOGIN_HREF = '/admin'
