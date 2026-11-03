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
    {
      name: 'status',
      type: 'select',
      label: 'Status pelaksanaan',
      required: true,
      defaultValue: 'rencana',
      index: true,
      options: [
        { label: 'Rencana', value: 'rencana' },
        { label: 'Berjalan', value: 'berjalan' },
        { label: 'Selesai', value: 'selesai' },
        { label: 'Ditunda', value: 'ditunda' },
      ],
      admin: { position: 'sidebar', description: 'Dipakai pada bagian "Progres Program Kerja" di situs.' },
    },
    {
      name: 'sessions',
      type: 'select',
      hasMany: true,
      label: 'Sesi hari kegiatan',
      options: [
        { label: 'Pagi (04.00–10.59)', value: 'pagi' },
        { label: 'Siang (11.00–14.59)', value: 'siang' },
        { label: 'Sore (15.00–17.59)', value: 'sore' },
        { label: 'Malam (18.00–03.59)', value: 'malam' },
      ],
      admin: { description: 'Dipakai heatmap: makin banyak sesi terisi dalam sehari, makin pekat kotaknya. Kosongkan bila belum jelas (dihitung 1 sesi).' },
    },
    { name: 'startDate', type: 'date', label: 'Mulai' },
    { name: 'endDate', type: 'date', label: 'Selesai' },
    { name: 'location', type: 'text', label: 'Lokasi' },
    { name: 'description', type: 'richText', label: 'Deskripsi' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Gambar sampul' },
    { name: 'album', type: 'relationship', relationTo: 'albums', label: 'Album foto' },
    { name: 'registrationUrl', type: 'text', label: 'Link pendaftaran' },
  ],
}
