import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  typescript: { interface: 'Testimonial' },
  labels: { singular: 'Testimoni', plural: 'Testimoni' },
  admin: { useAsTitle: 'authorName', defaultColumns: ['authorName', 'authorRole', 'kind'], group: 'Konten' },
  access: {
    read: anyone,
    create: hasRole('humas'),
    update: hasRole('humas'),
    delete: hasRole('humas'),
  },
  fields: [
    { name: 'authorName', type: 'text', label: 'Nama', required: true },
    { name: 'authorRole', type: 'text', label: 'Peran', admin: { description: 'Mis. "Alumni 2020", "Mitra"' } },
    { name: 'quote', type: 'textarea', label: 'Kutipan', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto' },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Sumber kutipan',
      admin: { description: 'Opsional. Tautan berita atau dokumen tempat kutipan ini dimuat.' },
    },
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      label: 'Edisi kegiatan',
      admin: { position: 'sidebar', description: 'Opsional. Bila diisi, kutipan juga tampil di halaman edisi dan program kegiatan itu.' },
    },
    {
      name: 'kind',
      type: 'select',
      label: 'Jenis',
      defaultValue: 'testimoni',
      options: [
        { label: 'Testimoni (bagian Prestasi & Testimoni)', value: 'testimoni' },
        { label: 'Kutipan tokoh (bagian Jejak Kepemimpinan)', value: 'tokoh' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
