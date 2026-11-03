# HMTI Public — Desain (Spec)

Tanggal: 2026-11-02 · Status: disetujui user (bagian 1 & 2 + revisi skeleton) · Dokumen pendamping: analisis wireframe & riset pembanding (di sesi brainstorming).

## Tujuan
Web profil publik himpunan dengan CMS agar admin dapat mengubah konten dan, terutama, **mengganti kepengurusan tiap periode** tanpa kehilangan data lama. Sistem internal (login, manajemen organisasi) belum ada dan akan dibangun kemudian di atas DB yang sama.

## Keputusan
| Topik | Keputusan |
|---|---|
| Stack | Next.js (App Router) + TypeScript + Tailwind v4 + Payload CMS 3, satu app |
| DB | SQLite (dev) / Postgres (production) lewat `DATABASE_URI`; model data sama |
| Sumber data anggota | DB ini; sistem internal nanti memakai collection yang sama |
| Layanan | Alur penuh di web publik (form → antrean admin → status/email); dikerjakan setelah skeleton |
| Bahasa | Indonesia |
| Gaya visual | Belum final. Token terpusat; referensi (mis. gaya editorial "Pengurus Kabinet" HMTC ITS: penomoran `Vol. n / total`) menyusul |

## Model data (ringkas)
`Period` (status draft/active/archived, satu aktif) · `Person` (NIM/kontak hanya terlihat staf) · `Department` (grup Internal/Eksternal) · `Membership` (person × period × department × position; department kosong = BPH) · `Program` (seri proker, relasi ke `Department` penyelenggara) → `Edition` (per periode) · `Achievement` · `Testimonial` · `Article` (draft/publish) · `Album` (foto, tahun, bestOfYear) · `Faq` · `Document` · `Partner` · `Service` (+ field form dinamis) · `ServiceRequest` (kode pelacakan, status, riwayat) · `InventoryItem` · `Loan` · global `SiteSetting`.

Domain: departemen penaung proker = **Intelektual** dan **RINOYA** (Riset Inovasi dan Karya). IBM (Interaksi Bulanan Mahasiswa) → Intelektual; PenMas, Dies Natalis, I-Fest (Informatics Festival) → RINOYA.

## Sitemap
`/` · `/tentang` · `/kepengurusan(?periode=)` · `/kepengurusan/[dept]` · `/kegiatan` · `/kegiatan/[program]` · `/kegiatan/[program]/[tahun]` · `/berita` · `/berita/[slug]` · `/galeri(?tahun=)` · `/galeri/[album]` · `/layanan` · `/layanan/[service]` · `/layanan/lacak` · `/kontak` · `/aspirasi` · `/admin` (Payload).

## Akses
Role: `superadmin`, `humas`, `sekretaris`, `inventaris`, `bisnis`. Konten publik dapat dibaca siapa pun; field sensitif (NIM, kontak) dan `ServiceRequest` hanya staf. Pembuatan `ServiceRequest` terbuka untuk publik (kelak dengan captcha + rate limit).

## Milestone
- **M0 Skeleton (selesai di commit ini):** semua route & section wireframe dengan konten placeholder, collection + seed dummy, token desain, form stub.
- **M1:** data nyata, gaya Kepengurusan final, wizard rollover periode.
- **M2:** konten publik penuh, SEO/sitemap.
- **M3:** Layanan penuh (server action, Zod, captcha, email, antrean admin, lacak).
- **M4:** peminjaman inventaris (cek bentrok), penyuratan lanjutan, polish, tes E2E.

## Di luar skeleton (disengaja)
Form Layanan aktif, cek bentrok `Loan`, wizard rollover, email, captcha, lint, tes otomatis, penyimpanan media produksi, ISR/revalidasi (skeleton merender dinamis).

## Risiko / catatan
- Payload mengunci konsep admin; model data tetap portabel karena ada di kode.
- Grup Internal/Eksternal departemen pada seed hanya tebakan; ganti dengan dokumen himpunan.
- Layanan penuh + sistem internal akan beririsan: keputusan role & SSO diambil di M3/M4.
