import type { CollectionConfig } from 'payload'
import { hasRole, isStaff } from '../access'

/** Jenis berkas surat yang diterima dari formulir layanan publik. */
export const LETTER_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

/**
 * Surat masuk dari formulir layanan (peminjaman inventaris, penyuratan, media partner, kerja sama).
 * Berkas disimpan di folder /surat (di luar public/, tidak ikut repo) dan hanya bisa dibuka pengurus yang login:
 * akses baca = staf, jadi /api/letters/file/... menolak pengunjung. Publik tidak bisa mengunggah langsung; unggahan
 * hanya lewat server action actions/letter.ts yang memvalidasi jenis, ukuran, dan isi berkas.
 */
export const Letters: CollectionConfig = {
  slug: 'letters',
  typescript: { interface: 'Letter' },
  labels: { singular: 'Surat Masuk', plural: 'Surat Masuk' },
  admin: { group: 'Layanan', defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'] },
  access: {
    read: isStaff,
    create: hasRole('sekretaris'),
    update: hasRole('sekretaris'),
    delete: hasRole('sekretaris'),
  },
  upload: {
    staticDir: 'surat',
    mimeTypes: LETTER_MIME,
  },
  fields: [],
}
