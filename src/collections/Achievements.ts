import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  typescript: { interface: 'Achievement' },
  labels: { singular: 'Prestasi', plural: 'Prestasi' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'level', 'rank', 'year'], group: 'Konten' },
  access: {
    read: anyone,
    create: hasRole('humas'),
    update: hasRole('humas'),
    delete: hasRole('humas'),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Nama lomba / pencapaian', required: true },
    { name: 'rank', type: 'text', label: 'Peringkat', admin: { description: 'Mis. "Juara 1"' } },
    {
      name: 'level',
      type: 'select',
      label: 'Tingkat',
      options: [
        { label: 'Kampus', value: 'kampus' },
        { label: 'Regional', value: 'regional' },
        { label: 'Nasional', value: 'nasional' },
        { label: 'Internasional', value: 'internasional' },
      ],
    },
    { name: 'team', type: 'text', label: 'Tim / peraih' },
    { name: 'year', type: 'number', label: 'Tahun', required: true },
    { name: 'proof', type: 'upload', relationTo: 'media', label: 'Bukti / foto' },
    { name: 'featured', type: 'checkbox', label: 'Tampil di beranda', defaultValue: false },
  ],
}
