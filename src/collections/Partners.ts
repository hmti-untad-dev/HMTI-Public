import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Partners: CollectionConfig = {
  slug: 'partners',
  typescript: { interface: 'Partner' },
  labels: { singular: 'Mitra', plural: 'Mitra' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'editions'], group: 'Konten' },
  access: {
    read: anyone,
    create: hasRole('humas', 'bisnis'),
    update: hasRole('humas', 'bisnis'),
    delete: hasRole('humas', 'bisnis'),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
    { name: 'url', type: 'text', label: 'Situs' },
    {
      name: 'role',
      type: 'select',
      label: 'Peran',
      defaultValue: 'sponsor',
      options: [
        { label: 'Kolaborator', value: 'kolaborator' },
        { label: 'Sponsor utama', value: 'sponsor-utama' },
        { label: 'Sponsor', value: 'sponsor' },
        { label: 'Media partner', value: 'media' },
      ],
    },
    {
      name: 'editions',
      type: 'relationship',
      relationTo: 'editions',
      hasMany: true,
      label: 'Edisi kegiatan',
      admin: { description: 'Edisi yang didukung mitra ini; tampil di halaman edisi tersebut.' },
    },
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
