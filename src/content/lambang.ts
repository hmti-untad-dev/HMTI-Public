/**
 * Makna lambang HMTI UNTAD — sumber: AD/ART 2026, Pasal 4 (Atribut: Lambang), butir a-h.
 * Koordinat `shape` memakai kanvas 0-100 di atas gambar lambang (pusat 50,50).
 * PEMETAAN unsur -> bagian gambar adalah tafsiran visual; geser angka di sini bila kurang pas.
 */
export type LambangShape =
  | { kind: 'ring'; r: number; w: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'box'; x: number; y: number; w: number; h: number }

export type LambangPart = {
  id: string
  name: string
  /** Label pendek untuk tombol pemilih. */
  short: string
  meaning: string
  shape: LambangShape
}

export const LAMBANG_PARTS: LambangPart[] = [
  {
    id: 'lingkaran',
    short: 'Lingkaran',
    name: 'Lingkaran',
    meaning: 'Kekompakan dan solidaritas yang tidak pernah putus antar anggota himpunan.',
    shape: { kind: 'ring', r: 49.1, w: 1.8 },
  },
  {
    id: 'hitam',
    short: 'Hitam',
    name: 'Hitam',
    meaning: 'Kekuatan dan ketegasan, sekaligus warna persatuan Fakultas Teknik.',
    shape: { kind: 'ring', r: 46.9, w: 4.2 },
  },
  {
    id: 'biru',
    short: 'Biru',
    name: 'Biru',
    meaning: 'Kesetiaan, kepercayaan, pengabdian, dan loyalitas.',
    shape: { kind: 'ring', r: 41.9, w: 5.8 },
  },
  {
    id: 'putih',
    short: 'Putih',
    name: 'Putih',
    meaning: 'Kedamaian, pencapaian diri, kesederhanaan, dan keamanan.',
    shape: { kind: 'circle', cx: 50, cy: 50, r: 36.8 },
  },
  {
    id: 'usb',
    short: 'USB',
    name: 'Universal Serial Bus (USB)',
    meaning: 'Penghubung dan pemersatu anggota himpunan. Simbol USB mencakup keseluruhan glyph, termasuk sinyal, cincin open source, dan lingkaran satelit di dalamnya.',
    shape: { kind: 'box', x: 23.2, y: 34.2, w: 53.6, h: 31.2 },
  },
  {
    id: 'sinyal',
    short: 'Sinyal',
    name: 'Sinyal',
    meaning: 'Mahasiswa himpunan selalu aktif dan tidak berhenti untuk berkarya.',
    shape: { kind: 'box', x: 57, y: 35, w: 12.5, h: 12.5 },
  },
  {
    id: 'open-source',
    short: 'Open Source',
    name: 'Open Source',
    meaning: 'HMTI UNTAD bersifat terbuka dan saling berbagi ilmu pengetahuan.',
    shape: { kind: 'circle', cx: 31.3, cy: 53.3, r: 7.6 },
  },
  {
    id: 'satelit',
    short: 'Satelit',
    name: 'Lingkaran Satelit',
    meaning:
      'HMTI UNTAD menjalin kerja sama atau kolaborasi ke berbagai individu maupun institusi yang sesuai dengan visi dan misi himpunan.',
    shape: { kind: 'circle', cx: 57.3, cy: 45.3, r: 3.7 },
  },
]
