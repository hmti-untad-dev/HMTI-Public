# PRD — Web Profil Publik & CMS HMTI UNTAD

**Status:** Draft 0.1 · **Tanggal:** 2026-11-03 · **Penyusun:** `[ISI: nama]` · **Penanggung jawab produk:** `[ISI: nama]`
**Keterangan penanda:** ✅ sudah diputuskan · 📄 bersumber dokumen MUBES 2026 · ❓ belum diputuskan · `[ISI: …]` ruang untuk kamu isi

---

## 1. Ringkasan
Web profil publik Himpunan Mahasiswa Teknik Informatika Universitas Tadulako (HMTI UNTAD) dengan CMS agar pengurus dapat mengubah konten dan **mengganti kepengurusan tiap periode tanpa kehilangan data periode lama**. Web ini juga memuat layanan publik (peminjaman inventaris, penyuratan, kerja sama, jasa). Sistem internal manajemen organisasi (login anggota) belum ada dan akan dibangun kemudian di atas basis data yang sama.

## 2. Latar belakang & masalah
- Pergantian pengurus tiap tahun (MUBES, masa jabatan 1 tahun 📄) membuat informasi dan dokumentasi himpunan mudah hilang atau terpecah. `[ISI: contoh masalah nyata yang pernah terjadi]`
- Saran periode 2025 menyebut kebutuhan pendataan anggota/inventaris yang rapi, dokumentasi kegiatan, dan sistem untuk pendataan anggota 📄. `[ISI: masalah lain yang ingin diselesaikan]`
- Identitas dan layanan himpunan belum punya satu pintu resmi bagi mahasiswa, alumni, mitra, dan sponsor. `[ISI: kondisi sekarang — Instagram/Drive/WA?]`

## 3. Tujuan & ukuran keberhasilan
| # | Tujuan | Ukuran keberhasilan | Target |
|---|---|---|---|
| 1 | Pengurus baru dapat mengambil alih konten dalam satu hari tanpa developer | Waktu dari "periode baru dibuat" sampai "dipublikasikan" | `[ISI]` |
| 2 | Arsip periode lama tetap bisa dilihat publik | Periode lama tampil di pemilih periode | 100% periode |
| 3 | Layanan publik berjalan lewat web, bukan chat pribadi | Persentase permintaan layanan yang masuk lewat web | `[ISI]` |
| 4 | Web jadi rujukan resmi | Kunjungan/bulan, permintaan layanan/bulan | `[ISI]` |

**Bukan tujuan (saat ini):** sistem internal anggota (login, absensi, keuangan, LPJ), forum/komentar, multi-bahasa, pembayaran daring. `[ISI: tambah/koreksi]`

## 4. Pengguna
| Peran | Kebutuhan utama | Catatan |
|---|---|---|
| Mahasiswa / calon anggota | Kenal himpunan, lihat kegiatan, pengurus, aspirasi, ajukan layanan | |
| Alumni | Lihat riwayat, kabar | `[ISI: perlu halaman alumni?]` |
| Mitra / sponsor / media | Ajukan kerja sama, media partner, unduh proposal | |
| Pengunjung umum / pihak kampus | Profil resmi, kontak | |
| Admin Humas | Berita, galeri, kegiatan, prestasi | peran `humas` |
| Admin Sekretaris | Kepengurusan, penyuratan, dokumen | peran `sekretaris` (Sekum / Kesekretariatan) |
| Admin Inventaris | Barang & peminjaman | peran `inventaris` (Kesekretariatan 📄) |
| Admin Bisnis | Layanan jasa | peran `bisnis` (Ekonomi Kreatif 📄) |
| Superadmin | Semua akses, kelola admin | `[ISI: siapa yang memegang?]` |

## 5. Struktur organisasi yang dimodelkan 📄
- **Nama:** Himpunan Mahasiswa Teknik Informatika Universitas Tadulako (HMTI UNTAD), Jurusan Teknologi Informasi, Fakultas Teknik. ❓ Penulisan resmi "Teknik Informatika" vs "Teknologi Informasi": `[ISI: pakai yang mana di situs]`
- **Badan resmi:** Dewan Perwakilan Angkatan (DPA), Dewan Eksekutif, Badan Pengawas Organisasi (BPO).
- **Dewan Eksekutif:** Ketua Umum, Ketua I, Ketua II, Sekretaris Umum, Bendahara Umum, Koordinator Departemen.
- **Departemen 2026:** Kesekretariatan, Intelektual, Kaderisasi (diawasi Ketua I → grup *Internal* ✅) · Humas, Ekonomi Kreatif, Riset-Inovasi-Karya/RINOYA (diawasi Ketua II → grup *Eksternal* ✅).
- **Komunitas binaan:** Programming Tadulako, Animedia Tadulako. ❓ Tampil di situs? `[ISI]`
- **Keanggotaan:** Pasif → Muda (lulus ALGOMATIK) → Biasa → Demisioner → Purna.
- **Program kerja unggulan:** IBM (Intelektual) · PenMas, Dies Natalis, I-Fest (RINOYA) ✅. Program lain: `[ISI: ALGOMATIK, Latihan Kepemimpinan, PERMIKOMNAS, dst. — tampil atau tidak?]`

## 6. Lingkup fitur
### 6.1 Halaman publik (wireframe disetujui ✅)
| Halaman | Isi inti | Prioritas |
|---|---|---|
| Beranda | Hero + statistik, Tentang, Tim, Kegiatan, Prestasi, Testimoni, Berita, Galeri, Layanan, FAQ | P0 |
| Tentang | Sejarah, Visi, Misi, Mars (teks & audio), dokumen (AD/ART, GBHO) | P0 |
| Kepengurusan | Pemilih periode, BPH, departemen Internal/Eksternal, nomor "Vol. n / total" | P0 |
| Kegiatan | Daftar proker → edisi per tahun | P0 |
| Berita | Daftar, detail, pagination | P0 |
| Galeri | Pemilih tahun, "The Best of", album | P1 |
| Layanan | Daftar Organisasi/Bisnis, form, lacak status | P1 |
| Kontak, Aspirasi | Alamat, email, sosial; form aspirasi | P1 |
| Alumni / Arsip materi / Agenda | `[ISI: masuk atau tidak, prioritas]` | ❓ |

### 6.2 CMS (admin)
- Kelola semua konten di §6.1, draft/publish, media library, role per divisi. ✅
- **Rollover periode** ✅ (tombol "Mulai Periode Baru"): buat periode draft, salin keanggotaan, aktifkan; periode lama otomatis arsip.
- `[ISI: kebutuhan CMS lain — mis. impor anggota dari Excel, jadwal publish, log perubahan]`

### 6.3 Layanan (alur penuh di web publik ✅, dikerjakan setelah skeleton)
Alur: form → antrean admin → status (baru → diproses → disetujui/ditolak → selesai) → email → lacak dengan kode.
Aturan peminjaman inventaris dari SOP 📄:
- Surat masuk → disposisi Ketua Umum → koordinasi Kesekretariatan.
- Internal: wajib foto KTP/KTM, denda Rp2.000/hari, dianggap hilang lewat 3 minggu.
- Eksternal: wajib surat resmi, DP 50%, lembar perjanjian, denda Rp10.000/hari, hilang lewat 3 minggu.
- Anggota terdaftar ALGOMATIK tidak dikenai biaya sewa.
- Jenis surat (Penyuratan): undangan, delegasi, peminjaman, sponsor, pemberitahuan kegiatan, SP, berita acara, mandat, permohonan, SK, kemitraan. `[ISI: mana yang boleh diajukan publik?]`
- ❓ Pembayaran/DP: dicatat manual atau tidak sama sekali di web? `[ISI]`
- ❓ Layanan bisnis (Jasa Website, Konsultasi, Service Hardware, Jasa Design): harga/tarif tampil? `[ISI]`

### 6.4 Di luar lingkup rilis awal
Sistem internal anggota, keuangan/LPJ, absensi, pembayaran online, notifikasi WA. `[ISI: koreksi]`

## 7. Aturan bisnis & data
- Satu periode berstatus **Aktif** pada satu waktu; yang lain Arsip/Draft. ✅
- Data periode lama tidak dihapus. ✅
- NIM dan kontak anggota tidak pernah tampil di publik. ✅
- Permintaan layanan hanya bisa dibaca staf; pembuatannya terbuka untuk publik (dengan captcha + batas laju kelak). ✅
- ❓ Siapa yang berhak membuat periode baru dan mengaktifkannya (Sekum? Ketua Umum?): `[ISI]`
- ❓ Waktu serah terima: SOP menyebut SK dan inventaris diurus ≥1 minggu setelah pelantikan 📄 — apakah rollover dikunci sebelum tanggal itu? `[ISI]`
- ❓ Retensi data permintaan layanan (berapa lama disimpan): `[ISI]`

## 8. Kebutuhan non-fungsional
- Bahasa Indonesia; tampil baik di ponsel (≥375px) dan desktop. ✅
- Aksesibilitas dasar (kontras, keyboard, teks alternatif gambar).
- Kinerja: halaman utama `[ISI: target mis. <2 detik di 4G]`.
- Keamanan: role per divisi, validasi server, tanpa kebocoran data pribadi, cadangan DB `[ISI: frekuensi]`.
- Hosting & domain: `[ISI: kampus/VPS/Vercel/Railway; domain apa]` · anggaran bulanan `[ISI]`.
- Stack ✅: Next.js + TypeScript + Tailwind + Payload CMS; SQLite (dev) / Postgres (produksi).

## 9. Desain & identitas
- Warna: biru tua, hitam, putih 📄 (lambang: lingkaran, USB, sinyal). Token desain terpusat di satu file.
- Referensi gaya: bagian "Pengurus Kabinet" HMTC ITS — editorial/majalah, penomoran `Vol. n / total`. Screenshot menyusul. `[ISI: referensi lain + hal yang tidak disukai]`
- Aset yang dibutuhkan: logo vektor, foto pengurus, foto kegiatan, audio Mars, daftar akun sosial. `[ISI: siapa yang menyiapkan & tenggat]`

## 10. Rencana rilis
| Milestone | Isi | Status | Target tanggal |
|---|---|---|---|
| M0 Skeleton | Semua halaman + CMS + seed + rollover | ✅ selesai (lokal) | — |
| M1 | Data nyata, gaya Kepengurusan final | | `[ISI]` |
| M2 | Konten publik penuh, SEO/sitemap | | `[ISI]` |
| M3 | Layanan penuh (form, antrean, email, lacak) | | `[ISI]` |
| M4 | Peminjaman (cek bentrok), polish, tes E2E | | `[ISI]` |
| Rilis publik | | | `[ISI]` |
| Serah terima ke pengurus berikutnya | Panduan admin + pelatihan | | `[ISI]` |

## 11. Tim & tanggung jawab
| Peran | Nama | Catatan |
|---|---|---|
| Product owner | `[ISI]` | |
| Developer web publik | `[ISI]` | |
| Developer sistem internal (teman) | `[ISI]` | basis data bersama: perlu kesepakatan skema |
| Penyedia konten / Humas | `[ISI]` | |
| Penyedia dokumen resmi / Sekretaris | `[ISI]` | |

## 12. Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Sistem internal belum ada, skema data bisa bentrok | Kerja ulang | Sepakati model `Period/Person/Membership` lebih dulu `[ISI: kapan rapat]` |
| Konten kosong/tidak diperbarui pengurus | Situs terlihat mati | Pemilik konten per divisi + checklist serah terima |
| Pergantian developer tiap periode | Situs tak terawat | Dokumentasi, kode sederhana, README |
| Layanan penuh memperpanjang rilis pertama | Rilis mundur | Layanan ditaruh di milestone terakhir |
| `[ISI: risiko lain]` | | |

## 13. Pertanyaan terbuka
1. `[ISI: ]` Siapa pemilik akhir situs setelah pergantian periode (organisasi/jurusan/fakultas)?
2. `[ISI: ]` Apakah fakultas atau jurusan mensyaratkan format/domain tertentu?
3. `[ISI: ]` Bagaimana status RINOYA di dokumen kampus (nama resmi dan singkatan)?
4. `[ISI: ]` Apakah testimoni dan alumni dipertahankan dari wireframe?
5. `[ISI: ]` …

## 14. Lampiran
- Wireframe Main + 5 halaman (Kegiatan, Berita, Layanan, Kepengurusan, Galeri).
- Dokumen sumber: AD/ART 2026, GBHO 2025, SOP 2026, Masukan & Saran Periode 2025 (MUBES 2026).
- Spec teknis: `docs/superpowers/specs/2026-11-02-hmti-public-design.md`.
