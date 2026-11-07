/**
 * Panduan admin: satu kalimat fungsi tiap koleksi (tampil di bawah judul daftar) dan isi tombol "?" untuk fitur
 * yang alurnya tidak langsung terlihat. Dipasang ke koleksi lewat payload.config.ts (withHelp), jadi menambah
 * panduan cukup di berkas ini.
 */
export type AdminHelp = {
  /** Satu kalimat: untuk apa koleksi ini. */
  summary: string
  /** Di halaman situs mana isinya tampil. */
  shownAt?: { label: string; href: string }[]
  /** Urutan kerja, bila ada alur. */
  steps?: string[]
  /** Hal yang mudah terlewat. */
  notes?: string[]
}

export const ADMIN_HELP: Record<string, AdminHelp> = {
  // ---------- Kepengurusan ----------
  periods: {
    summary: 'Satu baris per tahun kepengurusan (kabinet). Periode Aktif menentukan pengurus, visi-misi, dan data yang tampil di situs.',
    shownAt: [
      { label: 'Kepengurusan', href: '/kepengurusan' },
      { label: 'Tentang: Visi dan Misi', href: '/tentang#visi-misi' },
    ],
    steps: [
      'Akhir masa jabatan: tekan "Mulai Periode Baru" di atas daftar ini.',
      'Pilih periode asal, isi tahun dan nama kabinet baru. Centang "Salin keanggotaan" bila sebagian besar pengurus berlanjut.',
      'Periode baru dibuat sebagai Draft (kecuali "Langsung aktifkan" dicentang). Lengkapi visi, misi, dan susunan pengurusnya di Keanggotaan.',
      'Setelah siap, aktifkan periode baru. Periode lama menjadi Arsip dan tetap bisa dibuka lewat pemilih tahun di situs.',
    ],
    notes: ['Hanya satu periode yang boleh Aktif.'],
  },
  people: {
    summary: 'Data orang (pengurus, pembina, pengawas): nama, foto, angkatan, akun sosial. Jabatan per tahun diatur di Keanggotaan, bukan di sini.',
    shownAt: [{ label: 'Kepengurusan', href: '/kepengurusan' }],
    notes: ['NIM dan kontak hanya terlihat oleh pengurus yang login, tidak pernah keluar ke situs publik.', 'Satu orang cukup dibuat sekali walau menjabat beberapa periode.'],
  },
  departments: {
    summary: 'Departemen himpunan beserta deskripsinya. Nama lama (sebelum diganti) dipakai otomatis saat menampilkan periode lama.',
    shownAt: [{ label: 'Kepengurusan per departemen', href: '/kepengurusan' }],
    notes: ['Isi "Nama sebelumnya" dan "Nama sebelumnya dipakai sampai tahun" bila departemen berganti nama, supaya arsip periode lama tetap memakai nama yang benar.'],
  },
  memberships: {
    summary: 'Siapa menjabat apa di periode mana. Satu baris = satu orang di satu periode dengan satu jabatan.',
    shownAt: [{ label: 'Kepengurusan', href: '/kepengurusan' }],
    steps: [
      'Pastikan orangnya sudah ada di Anggota.',
      'Buat baris baru: pilih orang, periode, jabatan, dan departemen (kosongkan departemen untuk BPH).',
      'Atur Urutan untuk menentukan posisi di halaman Kepengurusan (angka kecil tampil lebih dulu).',
    ],
    notes: ['Centang "Foto berupa poster" bila fotonya sudah memuat nama dan jabatan, supaya teks tidak ditumpuk dua kali.'],
  },

  // ---------- Kegiatan ----------
  programs: {
    summary: 'Program kerja yang berulang tiap tahun (I-Fest, PenMas, Dies Natalis, ...). Detail per tahun diisi di Edisi Kegiatan.',
    shownAt: [
      { label: 'Kegiatan', href: '/kegiatan' },
      { label: 'Beranda: Program kerja', href: '/' },
    ],
    notes: ['Centang "Tampil di beranda" untuk maksimal empat program unggulan. Gambar sampul menjadi kartu di beranda.', 'Galeri program tampil di halaman program.'],
  },
  editions: {
    summary: 'Pelaksanaan sebuah program di tahun tertentu: tanggal, status, tema, angka, rangkaian acara, pemenang, dan liputan.',
    shownAt: [{ label: 'Halaman edisi, mis. I-Fest 2025', href: '/kegiatan/i-fest/2025' }],
    steps: [
      'Buat edisi untuk program dan periode yang sesuai, isi tanggal mulai dan status.',
      'Tanggal dan status menentukan warna di grafik aktivitas beranda (rencana, berjalan, selesai).',
      'Setelah acara: isi angka, rangkaian acara, pemenang, dan tautan liputan. Bagian yang kosong tidak ditampilkan.',
      'Kutipan tamu dan mitra pendukung dihubungkan dari Testimoni dan Mitra (pilih edisi ini di sana).',
    ],
  },
  'special-days': {
    summary: 'Tanggal penting yang diberi bendera kuning di grafik aktivitas beranda, mis. Dies Natalis atau hari H I-Fest.',
    shownAt: [{ label: 'Beranda: Denyut kegiatan', href: '/#denyut' }],
    notes: ['Centang "berulang" untuk peringatan tahunan: benderanya muncul di tanggal yang sama setiap tahun.'],
  },

  // ---------- Konten ----------
  articles: {
    summary: 'Berita, pengumuman, dan artikel. Bisa disimpan sebagai draf dulu sebelum terbit.',
    shownAt: [
      { label: 'Berita', href: '/berita' },
      { label: 'Beranda: Berita', href: '/' },
    ],
    steps: ['Tulis judul, ringkasan, sampul, dan isi.', 'Simpan sebagai draf untuk diperiksa pengurus lain.', 'Tekan Publish bila siap. Hanya berita terbit yang terlihat pengunjung.'],
    notes: ['Bila berita disadur dari situs lain, isi Sumber berita dan Tautan sumber: situs menampilkan "Disadur dari ...".', 'Centang Sorotan untuk berita utama.'],
  },
  albums: {
    summary: 'Album foto dokumentasi per kegiatan. Album yang punya sampul tampil lebih dulu di beranda.',
    shownAt: [
      { label: 'Galeri', href: '/galeri' },
      { label: 'Beranda: Galeri', href: '/' },
    ],
  },
  'best-photos': {
    summary: 'Foto pilihan "The Best of" per tahun yang tampil sebagai carousel polaroid.',
    shownAt: [{ label: 'Galeri', href: '/galeri' }],
  },
  achievements: {
    summary: 'Prestasi anggota dan himpunan. Centang "Tampil di beranda" untuk yang paling menonjol.',
    shownAt: [{ label: 'Beranda: Prestasi', href: '/' }],
  },
  testimonials: {
    summary: 'Kutipan dari alumni, mitra, atau pejabat. Bisa dihubungkan ke edisi kegiatan tempat kutipan itu diucapkan.',
    shownAt: [
      { label: 'Beranda: Kata mereka', href: '/' },
      { label: 'Halaman edisi kegiatan', href: '/kegiatan/i-fest/2025' },
    ],
    notes: ['Jenis "Kutipan tokoh" tampil di bagian Jejak Kepemimpinan, bukan di Testimoni.', 'Isi tautan sumber bila kutipan diambil dari berita.'],
  },
  researches: { summary: 'Hasil riset, temuan, dan artikel keilmuan dari Rinoya, Humas, dan Intelektual.', shownAt: [{ label: 'Riset', href: '/riset' }] },
  faqs: { summary: 'Pertanyaan yang sering diajukan. Dipakai juga oleh chat FAQ di situs.', shownAt: [{ label: 'Beranda: FAQ', href: '/#faq' }] },
  documents: {
    summary: 'Dokumen resmi (AD/ART, GBHO, proposal) yang bisa dibaca pengunjung tanpa diunduh.',
    shownAt: [{ label: 'Tentang: Dokumen', href: '/tentang#dokumen' }],
  },
  partners: {
    summary: 'Mitra, sponsor, dan media partner. Pilih edisi yang didukung agar logonya tampil di halaman edisi itu.',
    shownAt: [{ label: 'Halaman edisi kegiatan', href: '/kegiatan/i-fest/2025' }],
  },

  // ---------- Layanan ----------
  services: {
    summary: 'Daftar layanan himpunan. Layanan grup Organisasi memakai formulir unggah surat; grup Bisnis memakai formulir kontak.',
    shownAt: [{ label: 'Layanan', href: '/layanan' }],
    notes: ['Hilangkan centang "Aktif menerima permintaan" untuk menutup formulir sementara tanpa menghapus layanannya.'],
  },
  'service-requests': {
    summary: 'Permintaan yang masuk dari formulir layanan di situs, lengkap dengan surat, kode pelacakan, dan riwayat status.',
    shownAt: [{ label: 'Lacak permintaan', href: '/layanan/lacak' }],
    steps: [
      'Pemohon mengirim formulir dan surat. Permintaan masuk berstatus Baru dan pemohon menerima kode pelacakan.',
      'Buka permintaan, periksa surat di bagian "Surat dari pemohon", lalu ubah status ke Diproses.',
      'Putuskan: Disetujui atau Ditolak. Isi Catatan admin bila perlu (tidak terlihat oleh pemohon).',
      'Peminjaman inventaris yang Disetujui otomatis membuat catatan Peminjaman per barang, dan stok di katalog berkurang untuk tanggal itu.',
      'Setelah barang kembali atau layanan tuntas, ubah ke Selesai. Peminjamannya ikut ditandai Dikembalikan.',
    ],
    notes: [
      'Setiap perubahan status tercatat di Riwayat status dan bisa dilihat pemohon di halaman Lacak dengan kode dan email.',
      'Ditolak membatalkan peminjaman yang sudah terlanjur dibuat.',
    ],
  },
  letters: {
    summary: 'Berkas surat (PDF, Word, atau foto) yang diunggah pemohon. Hanya bisa dibuka pengurus yang login.',
    notes: ['Surat terhubung ke Permintaan Layanan; buka dari permintaannya agar konteksnya jelas.'],
  },
  'chat-messages': {
    summary: 'Pesan dari form Kontak, chat FAQ, dan layanan grup Bisnis. Ubah status ke "Sudah dibalas" setelah ditanggapi.',
    shownAt: [{ label: 'Kontak', href: '/kontak' }],
  },
  inventory: {
    summary: 'Seluruh barang himpunan. Barang Publik tampil di Daftar Inventaris; barang Internal hanya terlihat pengurus.',
    shownAt: [
      { label: 'Daftar inventaris', href: '/layanan/inventaris' },
      { label: 'Formulir peminjaman', href: '/layanan/peminjaman-inventaris' },
    ],
    steps: [
      'Tambah atau ubah barang: nama, kategori, jumlah, satuan, lokasi, dan ikon.',
      'Tampil di situs: Publik untuk barang yang boleh diketahui umum, Internal untuk cap, arsip, ATK, dapur, dan sejenisnya.',
      'Centang "Bisa dipinjam" agar barang muncul di katalog formulir peminjaman.',
      'Sisa stok di katalog = jumlah dikurangi Peminjaman yang tanggalnya bertumpang tindih.',
    ],
    notes: ['Tempat penyimpanan tidak pernah tampil di situs.', 'Barang Internal disaring di aturan akses, jadi API publik pun tidak mengembalikannya.'],
  },
  loans: {
    summary: 'Catatan barang yang sedang atau akan dipinjam. Dibuat otomatis saat Permintaan Layanan peminjaman disetujui.',
    steps: [
      'Dijadwalkan: dibuat saat permintaan disetujui; stok untuk tanggal itu sudah dipesan.',
      'Dipinjam: ubah saat barang diambil peminjam.',
      'Dikembalikan: barang sudah kembali; stok tersedia lagi.',
      'Dibatalkan: peminjaman batal; stok dilepas.',
    ],
    notes: ['Peminjaman bisa juga dibuat manual di sini untuk pinjaman yang tidak lewat formulir situs.'],
  },

  // ---------- Sistem ----------
  media: { summary: 'Semua foto dan berkas yang diunggah. Isi teks alternatif agar foto bisa "dibaca" pembaca layar.' },
  users: {
    summary: 'Akun pengurus yang bisa masuk ke admin ini. Role menentukan koleksi mana yang boleh diubah.',
    notes: [
      'superadmin: semua. humas: berita, galeri, kegiatan. sekretaris: kepengurusan dan penyuratan. inventaris: barang dan peminjaman. bisnis: layanan jasa.',
      'Admin hanya dibuka lewat alamat /admin; tidak ada tombol masuk di situs.',
    ],
  },
  'site-settings': {
    summary: 'Pengaturan yang berlaku untuk seluruh situs: identitas, hero beranda, kontak, media sosial, dan kursor.',
    notes: ['Kursor: pilih salah satu dari tiga kursor bertema HMTI, atau Bawaan untuk kursor biasa. Perubahan berlaku untuk semua pengunjung.'],
  },
}
