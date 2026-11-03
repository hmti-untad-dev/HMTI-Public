import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Editions: CollectionConfig = {
  slug: 'editions',
  typescript: { interface: 'Edition' },
  labels: { singular: 'Edisi Kegiatan', plural: 'Edisi Kegiatan' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'program', 'period', 'startDate'], group: 'Kegiatan' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole(),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul edisi', required: true },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true, index: true },
    { name: 'period', type: 'relationship', relationTo: 'periods', required: true, index: true },
    { name: 'startDate', type: 'date', label: 'Mulai' },
    { name: 'endDate', type: 'date', label: 'Selesai' },
    { name: 'location', type: 'text', label: 'Lokasi' },
    { name: 'description', type: 'richText', label: 'Deskripsi' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Gambar sampul' },
    { name: 'album', type: 'relationship', relationTo: 'albums', label: 'Album foto' },
    { name: 'registrationUrl', type: 'text', label: 'Link pendaftaran' },
  ],
}
