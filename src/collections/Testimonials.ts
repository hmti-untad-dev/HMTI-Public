import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  typescript: { interface: 'Testimonial' },
  labels: { singular: 'Testimoni', plural: 'Testimoni' },
  admin: { useAsTitle: 'authorName', defaultColumns: ['authorName', 'authorRole'], group: 'Konten' },
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
  ],
}
