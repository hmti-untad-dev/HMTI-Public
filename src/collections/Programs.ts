import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

/** Proker sebagai seri berulang (I-Fest, IBM, ...). Tiap tahun = satu Edition. */
export const Programs: CollectionConfig = {
  slug: 'programs',
  typescript: { interface: 'Program' },
  labels: { singular: 'Program Kerja', plural: 'Program Kerja' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'department', 'featured'], group: 'Kegiatan' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris'),
    update: hasRole('humas', 'sekretaris'),
    delete: hasRole(),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true, admin: { description: 'Mis. "Informatics Festival"' } },
    { name: 'shortName', type: 'text', label: 'Singkatan', admin: { description: 'Mis. "I-Fest"' } },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      label: 'Departemen penyelenggara',
      admin: { description: 'Mis. Intelektual atau RINOYA.' },
    },
    { name: 'summary', type: 'textarea', label: 'Ringkasan' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Gambar sampul' },
    { name: 'featured', type: 'checkbox', label: 'Tampil di beranda', defaultValue: false },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
