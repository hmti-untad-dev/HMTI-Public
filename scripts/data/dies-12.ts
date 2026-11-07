/**
 * Berita malam puncak Dies Natalis ke-12 (22 Agustus 2026), disadur dengan kata-kata sendiri dari berita situs
 * Jurusan Teknologi Informasi UNTAD (tautan sumber dicantumkan di halaman). Foto dari pengurus, disimpan di
 * seed-assets/berita/ (tidak ikut repo).
 */
import { lexicalParagraphs } from './ifest-2025'

export const DIES_12 = {
  title: 'Malam Puncak Dies Natalis ke-12 HMTI UNTAD: The Continuum, Colors of Our Journey',
  slug: 'malam-puncak-dies-natalis-ke-12',
  category: 'berita' as const,
  excerpt: 'HMTI UNTAD merayakan 12 tahun perjalanannya pada malam puncak Dies Natalis ke-12, Sabtu, 22 Agustus 2026, di Gedung Kesenian Palu.',
  author: 'HMTI UNTAD',
  publishedAt: '2026-08-24T09:00:00.000+08:00',
  featured: true,
  sourceName: 'Situs Jurusan Teknologi Informasi UNTAD',
  sourceUrl: 'https://jti.fatek.untad.ac.id/berita/hmti-untad-gelar-malam-puncak-dies-natalis-ke-12-dengan-tema-the-continuum-colors-of-our-journey',
  paragraphs: [
    'Himpunan Mahasiswa Teknik Informatika Universitas Tadulako menggelar malam puncak Dies Natalis ke-12 pada Sabtu, 22 Agustus 2026, di Gedung Kesenian Palu. Perayaan ini menandai 12 tahun perjalanan himpunan sejak dibentuk pada 2014.',
    'Tema yang diangkat, "The Continuum: Colors of Our Journey", memandang sejarah HMTI sebagai proses yang terus bersambung: setiap generasi meneruskan proses, pengalaman, karya, dan prestasi dari generasi sebelumnya. Spanduk acara merangkumnya sebagai estafet kebersamaan lintas generasi yang terus bergerak dan berinovasi.',
    'Malam puncak dihadiri anggota HMTI UNTAD, alumni dan senior, panitia Dies Natalis ke-12, serta tamu dari organisasi kemahasiswaan dan para dosen. Selain merayakan hari jadi, acara ini menjadi ruang untuk mempererat hubungan antargenerasi, menghargai kontribusi angkatan terdahulu, dan meneruskan estafet kepemimpinan organisasi.',
    'Lewat perayaan ini, HMTI UNTAD berharap generasi berikutnya terus membawa nilai, pengalaman, dan semangat himpunan untuk menulis babak baru perjalanannya.',
  ],
  photos: [
    { file: 'dies-12-foto-bersama.jpg', caption: 'Foto bersama di depan tumpeng Dies Natalis ke-12 HMTI UNTAD' },
    { file: 'dies-12-acara.jpg', caption: 'Suasana malam puncak Dies Natalis ke-12' },
  ],
}

/**
 * Membuat berita Dies Natalis ke-12. `mediaFrom(file, alt)` mengunggah foto dari seed-assets/berita dan
 * mengembalikan id media (atau undefined bila berkas tidak ada). Aman diulang: dilewati bila slug sudah ada.
 */
export async function createDies12(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  mediaFrom: (file: string, alt: string) => Promise<number | undefined>,
) {
  const found = await payload.find({ collection: 'articles', where: { slug: { equals: DIES_12.slug } }, limit: 1 })
  if (found.totalDocs > 0) return found.docs[0]
  const photos = []
  for (const p of DIES_12.photos) {
    const id = await mediaFrom(p.file, p.caption)
    if (id) photos.push({ image: id, caption: p.caption })
  }
  const { paragraphs, photos: _photos, ...rest } = DIES_12
  return payload.create({
    collection: 'articles',
    data: { ...rest, content: lexicalParagraphs(paragraphs), cover: photos[0]?.image, gallery: photos.slice(1), _status: 'published' },
  })
}

/**
 * Dokumentasi Dies Natalis ke-12 sebagai proker Rinoya: foto berita dipasang sebagai sampul dan galeri program
 * "Dies Natalis", edisi 2026 diisi tanggal, tempat, dan tema malam puncak, dan album dokumentasinya diisi foto
 * yang sama (tampil di beranda). Rangkaian acara (timeline) sengaja dibiarkan kosong sampai datanya ada.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function documentDies12(payload: any) {
  const article = (await payload.find({ collection: 'articles', where: { slug: { equals: DIES_12.slug } }, limit: 1, depth: 0 })).docs[0]
  if (!article?.cover) return false
  const photos = [
    { image: article.cover, caption: DIES_12.photos[0].caption },
    ...(article.gallery ?? []).map((g: { image: number; caption?: string }) => ({ image: g.image, caption: g.caption })),
  ]

  const program = (await payload.find({ collection: 'programs', where: { slug: { equals: 'dies' } }, limit: 1, depth: 0 })).docs[0]
  if (!program) return false
  await payload.update({
    collection: 'programs',
    id: program.id,
    data: {
      cover: article.cover,
      gallery: photos,
      summary: 'Perayaan hari jadi himpunan sejak Dies Natalis pertama pada 2015. Dies Natalis ke-12 digelar Departemen Riset, Inovasi, dan Karya (Rinoya).',
    },
  })

  const period = (await payload.find({ collection: 'periods', where: { year: { equals: 2026 } }, limit: 1, depth: 0 })).docs[0]
  const edition = period
    ? (await payload.find({ collection: 'editions', where: { and: [{ program: { equals: program.id } }, { period: { equals: period.id } }] }, limit: 1, depth: 0 })).docs[0]
    : undefined

  const albumData = { title: 'Dokumentasi Dies Natalis ke-12', year: 2026, cover: article.cover, photos }
  const albumFound = (await payload.find({ collection: 'albums', where: { title: { in: ['Dokumentasi Dies Natalis 2026', albumData.title] } }, limit: 1, depth: 0 })).docs[0]
  const album = albumFound
    ? await payload.update({ collection: 'albums', id: albumFound.id, data: albumData })
    : await payload.create({ collection: 'albums', data: { ...albumData, slug: 'dokumentasi-dies-natalis-ke-12' } })

  if (edition) {
    await payload.update({
      collection: 'editions',
      id: edition.id,
      data: {
        title: 'Dies Natalis ke-12',
        status: 'selesai',
        startDate: '2026-08-22T00:00:00.000+08:00',
        endDate: null,
        location: 'Gedung Kesenian Palu',
        theme: 'The Continuum: Colors of Our Journey',
        description: lexicalParagraphs([DIES_12.paragraphs[0], DIES_12.paragraphs[1]]),
        cover: article.cover,
        album: album.id,
      },
    })
  }
  return true
}
