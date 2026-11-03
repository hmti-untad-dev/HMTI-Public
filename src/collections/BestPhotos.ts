import { APIError, type CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const BEST_PHOTO_LIMIT = 7

/** Foto pilihan "The Best of" per tahun untuk carousel polaroid di halaman Galeri. Maksimal 7 per tahun. */
export const BestPhotos: CollectionConfig = {
  slug: 'best-photos',
  typescript: { interface: 'BestPhoto' },
  labels: { singular: 'Foto Terbaik', plural: 'Foto Terbaik (The Best of)' },
  admin: { useAsTitle: 'caption', defaultColumns: ['caption', 'year', 'order'], group: 'Konten', description: `Maksimal ${BEST_PHOTO_LIMIT} foto per tahun.` },
  access: {
    read: anyone,
    create: hasRole('humas'),
    update: hasRole('humas'),
    delete: hasRole('humas'),
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        const year = data.year ?? originalDoc?.year
        if (operation === 'update' && originalDoc?.year === year) return data
        const { totalDocs } = await req.payload.count({ collection: 'best-photos', where: { year: { equals: year } }, req })
        if (totalDocs >= BEST_PHOTO_LIMIT) {
          throw new APIError(`Tahun ${year} sudah berisi ${BEST_PHOTO_LIMIT} foto. Hapus salah satu dulu atau pilih tahun lain.`, 400, undefined, true)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto', required: true },
    { name: 'caption', type: 'text', label: 'Keterangan polaroid', required: true, maxLength: 60, admin: { description: 'Tulisan tangan di bawah foto, singkat saja.' } },
    { name: 'year', type: 'number', label: 'Tahun', required: true, index: true },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
