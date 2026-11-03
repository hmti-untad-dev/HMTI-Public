# HMTI Public

Web profil publik himpunan + CMS (Payload) untuk mengelola kepengurusan per periode.
Status: **skeleton** — semua halaman wireframe ada dengan konten placeholder; logika Layanan belum aktif.

## Jalankan
```bash
cp .env.example .env      # lalu isi PAYLOAD_SECRET
npm install
npm run seed              # data dummy + admin pertama (lihat SEED_ADMIN_* di .env)
npm run dev               # http://localhost:3000  ·  admin: /admin
```
SQLite dipakai secara default (`DATABASE_URI=file:./hmti.db`). Untuk Postgres isi `DATABASE_URI=postgres://...`.

Setelah mengubah collection: `npm run generate:types` dan `npm run generate:importmap`.

## Peta kode
| Lokasi | Isi |
|---|---|
| `src/styles/tokens.css` | **Satu-satunya** tempat warna/font/radius/spacing. Ganti di sini untuk ganti gaya. |
| `src/components/ui/` | Komponen dasar (Section, Button, Img, Empty, YearSelector, ...). |
| `src/components/sections/` | Satu file = satu section wireframe. Urutan beranda diatur di `src/app/(site)/page.tsx`. |
| `src/components/cards/` | Kartu (PersonCard, ProgramCard, ArticleCard, AlbumCard). Gaya "editorial" kepengurusan dipasang di `PersonCard`. |
| `src/lib/data.ts` | Semua query ke CMS. Halaman tidak memanggil Payload langsung. |
| `src/lib/nav.ts` | Menu utama. |
| `src/collections/`, `src/globals/` | Model data CMS. `src/access.ts` = role & aturan akses. |
| `scripts/seed.ts` | Data dummy. |

## Konsep inti: Periode
`Period` → `Membership` (orang × periode × departemen × jabatan). Data periode lama tidak dihapus,
hanya berstatus `archived` dan tetap tampil lewat pemilih periode di `/kepengurusan`.
Mengaktifkan periode baru otomatis mengarsipkan yang lama (hook di `src/collections/Periods.ts`).

## Belum ada (sengaja, milestone berikutnya)
Form Layanan sungguhan (server action, Zod, captcha, email), cek bentrok peminjaman, wizard rollover periode,
SEO per halaman/sitemap, tes otomatis, lint, penyimpanan media produksi.
