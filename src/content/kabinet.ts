/**
 * Filosofi Kabinet All Blue (kepengurusan 2026), dari materi pengenalan kabinet yang dikirim pengurus.
 * Lambangnya tidak memakai berkas gambar: digambar ulang sebagai SVG di components/kabinet/AllBlueMark.tsx
 * mengikuti makna tiga unsurnya.
 */
export type AllBlueLayer = 'vortex' | 'pixel' | 'core'

export const ALL_BLUE = {
  year: 2026,
  name: 'All Blue',
  philosophy: [
    'Dalam mitologi maritim, All Blue adalah lautan legenda, satu-satunya titik di dunia tempat empat arus samudra yang terpisah akhirnya bertemu, membawa serta seluruh keragaman kehidupan di dalamnya.',
    'Bagi kita, All Blue adalah manifestasi tertinggi dari identitas HMTI UNTAD. Warna biru yang mendominasi atribut dan almamater kebanggaan kita bukan sekadar warna: ia melambangkan kedalaman ilmu teknologi, ketenangan berpikir, dan potensi masa depan yang tak terbatas. All Blue adalah utopia kolaborasi yang inklusif, tempat seluruh arus peminatan melebur menjadi satu samudra kekuatan besar yang bergerak seirama.',
  ],
  elements: [
    {
      key: 'vortex' as AllBlueLayer,
      name: 'Pusaran Ombak',
      alias: 'Vortex',
      values: 'Fleksibilitas, kemanusiaan, dan ikatan persaudaraan.',
      text: 'Melambangkan fondasi HMTI yang humanis. Visual ini merupakan perwujudan Misi ke-3, yakni menciptakan lingkungan yang suportif dan kekeluargaan untuk menjamin kenyamanan seluruh anggota. Aliran ombak yang tenang juga merepresentasikan Misi ke-6, yaitu pengelolaan fasilitas himpunan agar menjadi tempat bernaung yang nyaman, aman, dan fungsional.',
      refs: ['Misi 3', 'Misi 6'],
      drawn: 'Empat lengan ombak, satu untuk tiap arus samudra, berputar pelan menuju satu titik.',
    },
    {
      key: 'pixel' as AllBlueLayer,
      name: 'Pusaran Piksel',
      alias: 'Digital Glitch',
      values: 'Proses belajar, digitalisasi, dan ketajaman teknis.',
      text: 'Melambangkan proses adaptasi, edukasi, dan ketajaman intelektual. Unsur ini mengakar pada Visi untuk mengedepankan keunggulan akademik dan Misi ke-2, yaitu memfasilitasi pengembangan hard skill dan soft skill anggota agar mampu bersaing secara profesional di bidang teknologi. Bentuk piksel yang terstruktur juga mencerminkan Misi ke-1 tentang manajemen organisasi yang transparan dan akuntabel.',
      refs: ['Visi', 'Misi 1', 'Misi 2'],
      drawn: 'Piksel yang tersusun di kisi tetap, berkedip seperti data yang sedang dipelajari, berputar berlawanan arah ombak.',
    },
    {
      key: 'core' as AllBlueLayer,
      name: 'Inti Bintang',
      alias: 'The Core Spark',
      values: 'Hasil akhir, tujuan mulia, dan karya yang bermanfaat.',
      text: 'Bintang ini adalah manifestasi Misi ke-5: mewadahi kreativitas anggota untuk menciptakan inovasi digital yang memberikan dampak dan solusi nyata bagi permasalahan di masyarakat. Pancaran cahayanya ke luar melambangkan Misi ke-4, yakni jalinan kerja sama strategis dengan alumni, birokrasi, instansi, dan komunitas luar kampus.',
      refs: ['Misi 4', 'Misi 5'],
      drawn: 'Bintang empat sudut di pusat pusaran, berdenyut dan memancarkan cahaya ke luar.',
    },
  ],
} as const
