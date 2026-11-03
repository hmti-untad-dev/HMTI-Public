import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  typescript: { interface: 'Media' },
  labels: { singular: 'Media', plural: 'Media' },
  admin: { group: 'Sistem' },
  access: {
    read: anyone,
    create: hasRole('humas', 'sekretaris', 'bisnis'),
    update: hasRole('humas', 'sekretaris', 'bisnis'),
    delete: hasRole('humas'),
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400 },
      { name: 'card', width: 800 },
    ],
  },
  fields: [{ name: 'alt', type: 'text', label: 'Teks alternatif' }],
}
