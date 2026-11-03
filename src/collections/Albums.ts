import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Albums: CollectionConfig = {
  slug: 'albums',
  typescript: { interface: 'Album' },
  labels: { singular: 'Album', plural: 'Album' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'year', 'bestOfYear'], group: 'Konten' },
  access: {
    read: anyone,
    create: hasRole('humas'),
    update: hasRole('humas'),
    delete: hasRole('humas'),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    { name: 'year', type: 'number', label: 'Tahun', required: true, index: true },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Sampul' },
    { name: 'bestOfYear', type: 'checkbox', label: 'Masuk "The Best of" tahun ini', defaultValue: false },
    {
      name: 'photos',
      type: 'array',
      label: 'Foto',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}
