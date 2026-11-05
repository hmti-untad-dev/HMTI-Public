/**
 * Data keanggotaan HMTI UNTAD per angkatan (TI + SI digabung), dari ringkasan "KETERANGAN" tiap sheet di buku induk
 * "HMTI UNTAD Membership 2026.xlsx". Tidak memuat nama atau stambuk. Perbarui angka di sini saat buku induk berubah.
 *
 * Definisi:
 * - Alumni = anggota berstatus Purna (sudah lulus).
 * - Anggota aktif = berstatus Biasa, Muda, atau Demisioner dan belum lulus (Demisioner berubah jadi Purna saat lulus).
 * - Pasif = mahasiswa yang tercatat tetapi tidak mengikuti kaderisasi.
 */
export type Cohort = { year: number; biasa: number; muda: number; demisioner: number; purna: number; pasif: number }

export const KEANGGOTAAN_PER = 'November 2026'
export const WISUDAWAN = { year: 2026, count: 46 } // 22 Februari (30) + 23 April (16)

export const COHORTS: Cohort[] = [
  { year: 2015, biasa: 0, muda: 0, demisioner: 0, purna: 84, pasif: 117 },
  { year: 2016, biasa: 0, muda: 0, demisioner: 0, purna: 63, pasif: 85 },
  { year: 2017, biasa: 0, muda: 0, demisioner: 0, purna: 144, pasif: 89 },
  { year: 2018, biasa: 0, muda: 0, demisioner: 22, purna: 105, pasif: 154 },
  { year: 2019, biasa: 0, muda: 0, demisioner: 25, purna: 67, pasif: 59 },
  { year: 2020, biasa: 0, muda: 0, demisioner: 39, purna: 79, pasif: 46 },
  { year: 2021, biasa: 0, muda: 4, demisioner: 47, purna: 39, pasif: 61 },
  { year: 2022, biasa: 0, muda: 3, demisioner: 47, purna: 17, pasif: 22 },
  { year: 2023, biasa: 137, muda: 9, demisioner: 0, purna: 0, pasif: 26 },
  { year: 2024, biasa: 140, muda: 12, demisioner: 0, purna: 0, pasif: 53 },
  { year: 2025, biasa: 125, muda: 41, demisioner: 0, purna: 0, pasif: 72 },
]

export const aktifOf = (c: Cohort) => c.biasa + c.muda + c.demisioner
export const TOTAL_ALUMNI = COHORTS.reduce((s, c) => s + c.purna, 0) // 598
export const TOTAL_AKTIF = COHORTS.reduce((s, c) => s + aktifOf(c), 0) // 651
