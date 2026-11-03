import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access'

export const Partners: CollectionConfig = {
  slug: 'partners',
  typescript: { interface: 'Partner' },
  labels: { singular: 'Mitra', plural: 'Mitra' },
  admin: { useAsTitle: 'name', group: 'Konten' },
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
    { name: 'order', type: 'number', label: 'Urutan', defaultValue: 0 },
  ],
}
